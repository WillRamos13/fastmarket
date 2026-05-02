package com.fashmarket.api.service;

import com.fashmarket.api.dto.CuponDtos;
import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.*;
import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.PedidoHistorialRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CuponService cuponService;
    private final PedidoHistorialRepository pedidoHistorialRepository;
    private final CarritoService carritoService;
    private final SystemConfigService systemConfigService;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository, CuponService cuponService, PedidoHistorialRepository pedidoHistorialRepository, CarritoService carritoService, SystemConfigService systemConfigService) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cuponService = cuponService;
        this.pedidoHistorialRepository = pedidoHistorialRepository;
        this.carritoService = carritoService;
        this.systemConfigService = systemConfigService;
    }

    public Page<PedidoDtos.PedidoResponse> listarPaginado(AuthTokenService.TokenData actor, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), Sort.by(Sort.Direction.DESC, "fecha"));
        if (actor.rol() == Rol.VENDEDOR) {
            return pedidoRepository.findByVendedorId(actor.usuarioId(), pageable).map(p -> DtoMapper.toPedidoResponse(p, actor.usuarioId()));
        }
        return pedidoRepository.findAll(pageable).map(DtoMapper::toPedidoResponse);
    }

    public List<PedidoDtos.PedidoResponse> listar(AuthTokenService.TokenData actor) {
        if (actor.rol() == Rol.VENDEDOR) {
            return pedidoRepository.findByVendedorIdOrderByFechaDesc(actor.usuarioId()).stream().map(p -> DtoMapper.toPedidoResponse(p, actor.usuarioId())).toList();
        }
        return pedidoRepository.findAllByOrderByFechaDesc().stream().map(DtoMapper::toPedidoResponse).toList();
    }

    public List<PedidoDtos.PedidoResponse> listarPorVendedor(Long vendedorId) {
        return pedidoRepository.findByVendedorIdOrderByFechaDesc(vendedorId).stream().map(p -> DtoMapper.toPedidoResponse(p, vendedorId)).toList();
    }

    public List<PedidoDtos.PedidoResponse> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream().map(DtoMapper::toPedidoResponse).toList();
    }

    public List<PedidoDtos.HistorialResponse> historial(AuthTokenService.TokenData actor, Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (actor.rol() == Rol.CLIENTE && !pedido.getUsuario().getId().equals(actor.usuarioId())) {
            throw new SecurityException("No autorizado para ver este historial");
        }
        if (actor.rol() == Rol.VENDEDOR) {
            boolean pertenece = pedido.getItems().stream().anyMatch(i -> i.getVendedor() != null && i.getVendedor().getId().equals(actor.usuarioId()));
            if (!pertenece) throw new SecurityException("No autorizado para ver este historial");
        }
        return pedidoHistorialRepository.findByPedidoIdOrderByFechaAsc(pedidoId).stream()
                .map(h -> new PedidoDtos.HistorialResponse(h.getId(), h.getEstadoAnterior(), h.getEstadoNuevo(), h.getActor() != null ? h.getActor().getNombre() : "Sistema", h.getMotivo(), h.getFecha()))
                .toList();
    }

    @Transactional
    public PedidoDtos.PedidoResponse crear(Long usuarioId, PedidoDtos.CrearPedidoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setCodigo("PED-" + System.currentTimeMillis());
        pedido.setDireccionEntrega(valor(request.direccionEntrega(), "Sin dirección"));
        pedido.setReferenciaEntrega(valor(request.referenciaEntrega(), ""));
        pedido.setHorarioEntrega(valor(request.horarioEntrega(), "No especificado"));
        pedido.setMetodoPago(valor(request.metodoPago(), "Pago contra entrega"));
        pedido.setTelefonoEntrega(valor(request.telefonoEntrega(), usuario.getTelefono()));
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado(EstadoPedido.PENDIENTE);

        BigDecimal subtotalPedido = BigDecimal.ZERO;

        for (PedidoDtos.ItemRequest itemRequest : request.items()) {
            Producto producto = productoRepository.findById(itemRequest.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

            if (!Boolean.TRUE.equals(producto.getActivo())) throw new IllegalArgumentException("El producto " + producto.getNombre() + " ya no está disponible");

            int cantidad = itemRequest.cantidad();
            if (cantidad <= 0) throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            if (producto.getStock() < cantidad) throw new IllegalArgumentException("Stock insuficiente para " + producto.getNombre() + ". Stock actual: " + producto.getStock());

            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);

            BigDecimal subtotalItem = producto.getPrecio().multiply(BigDecimal.valueOf(cantidad));

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProducto(producto);
            item.setProductoNombre(producto.getNombre());
            item.setCantidad(cantidad);
            item.setPrecioUnitario(producto.getPrecio());
            item.setSubtotal(subtotalItem);
            item.setVendedor(producto.getVendedor());

            pedido.getItems().add(item);
            subtotalPedido = subtotalPedido.add(subtotalItem);
        }

        BigDecimal costoEnvio = calcularCostoEnvio(subtotalPedido);

        BigDecimal descuento = BigDecimal.ZERO;
        if (request.cuponCodigo() != null && !request.cuponCodigo().isBlank()) {
            List<CuponDtos.AplicarCuponItemRequest> itemsCupon = request.items().stream()
                    .map(i -> new CuponDtos.AplicarCuponItemRequest(i.productoId(), i.cantidad()))
                    .toList();
            CuponService.CalculoCupon calculo = cuponService.calcularDescuento(request.cuponCodigo(), itemsCupon, usuarioId);
            descuento = calculo.descuento();
            pedido.setCuponCodigo(calculo.cupon() != null ? calculo.cupon().getCodigo() : request.cuponCodigo().trim().toUpperCase());
            // El uso se registra después de guardar el pedido para enlazar historial y pedido.
        }

        pedido.setSubtotal(subtotalPedido);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setDescuento(descuento);
        BigDecimal total = subtotalPedido.subtract(descuento).add(costoEnvio);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        pedido.setTotal(total);

        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, null, EstadoPedido.PENDIENTE, usuario, "Pedido creado");
        if (descuento.compareTo(BigDecimal.ZERO) > 0 && guardado.getCuponCodigo() != null) {
            List<CuponDtos.AplicarCuponItemRequest> itemsCupon = request.items().stream()
                    .map(i -> new CuponDtos.AplicarCuponItemRequest(i.productoId(), i.cantidad()))
                    .toList();
            CuponService.CalculoCupon calculo = cuponService.calcularDescuento(guardado.getCuponCodigo(), itemsCupon, usuarioId);
            cuponService.registrarUso(calculo.cupon(), usuario, guardado, descuento);
        }
        carritoService.limpiar(usuarioId);
        return DtoMapper.toPedidoResponse(guardado);
    }

    @Transactional
    public PedidoDtos.PedidoResponse actualizarEstado(AuthTokenService.TokenData actor, Long id, EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (actor.rol() == Rol.VENDEDOR) {
            throw new SecurityException("El vendedor no puede cambiar el estado general del pedido. El administrador controla el estado completo.");
        }
        EstadoPedido anterior = pedido.getEstado();
        if (anterior == estado) {
            return DtoMapper.toPedidoResponse(pedido);
        }
        pedido.setEstado(estado);
        Pedido guardado = pedidoRepository.save(pedido);
        Usuario actorUsuario = usuarioRepository.findById(actor.usuarioId()).orElse(null);
        registrarHistorial(guardado, anterior, estado, actorUsuario, "Cambio de estado");
        return DtoMapper.toPedidoResponse(guardado);
    }


    private BigDecimal calcularCostoEnvio(BigDecimal subtotalPedido) {
        BigDecimal costoConfigurado = systemConfigService.obtenerDecimal(SystemConfigService.COSTO_ENVIO, new BigDecimal("8.00"));
        if (costoConfigurado.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
        // Regla básica: envío gratis desde S/ 250.00. Puede cambiarse luego a configuración avanzada.
        if (subtotalPedido != null && subtotalPedido.compareTo(new BigDecimal("250.00")) >= 0) return BigDecimal.ZERO;
        return costoConfigurado;
    }

    private void registrarHistorial(Pedido pedido, EstadoPedido anterior, EstadoPedido nuevo, Usuario actor, String motivo) {
        PedidoHistorial historial = new PedidoHistorial();
        historial.setPedido(pedido);
        historial.setEstadoAnterior(anterior);
        historial.setEstadoNuevo(nuevo);
        historial.setActor(actor);
        historial.setMotivo(motivo);
        pedidoHistorialRepository.save(historial);
    }

    private String valor(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }
}
