package com.fastmarket.api.service;

import com.fastmarket.api.dto.CuponDtos;
import com.fastmarket.api.dto.EstadisticasDtos;
import com.fastmarket.api.dto.PedidoDtos;
import com.fastmarket.api.model.*;
import com.fastmarket.api.repository.PedidoRepository;
import com.fastmarket.api.repository.PedidoHistorialRepository;
import com.fastmarket.api.repository.ProductoRepository;
import com.fastmarket.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CuponService cuponService;
    private final PedidoHistorialRepository pedidoHistorialRepository;
    private final CarritoService carritoService;
    private final SystemConfigService systemConfigService;
    private final com.fastmarket.api.repository.CuponUsoRepository cuponUsoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository, CuponService cuponService, PedidoHistorialRepository pedidoHistorialRepository, CarritoService carritoService, SystemConfigService systemConfigService, com.fastmarket.api.repository.CuponUsoRepository cuponUsoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cuponService = cuponService;
        this.pedidoHistorialRepository = pedidoHistorialRepository;
        this.carritoService = carritoService;
        this.systemConfigService = systemConfigService;
        this.cuponUsoRepository = cuponUsoRepository;
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
        Map<Long, Integer> cantidadesPorProducto = agruparItemsPedido(request.items());
        if (cantidadesPorProducto.isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }

        List<CuponDtos.AplicarCuponItemRequest> itemsCupon = cantidadesPorProducto.entrySet().stream()
                .map(entry -> new CuponDtos.AplicarCuponItemRequest(entry.getKey(), entry.getValue()))
                .toList();

        for (Map.Entry<Long, Integer> entry : cantidadesPorProducto.entrySet()) {
            Producto producto = productoRepository.findById(entry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

            if (!Boolean.TRUE.equals(producto.getActivo())) throw new IllegalArgumentException("El producto " + producto.getNombre() + " ya no está disponible");

            int cantidad = entry.getValue();
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
        CuponService.CalculoCupon calculoCupon = null;
        if (request.cuponCodigo() != null && !request.cuponCodigo().isBlank()) {
            calculoCupon = cuponService.calcularDescuento(request.cuponCodigo(), itemsCupon, usuarioId);
            descuento = calculoCupon.descuento();
            pedido.setCuponCodigo(calculoCupon.cupon() != null ? calculoCupon.cupon().getCodigo() : request.cuponCodigo().trim().toUpperCase());
        }

        pedido.setSubtotal(subtotalPedido);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setDescuento(descuento);
        BigDecimal total = subtotalPedido.subtract(descuento).add(costoEnvio);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        pedido.setTotal(total);

        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, null, EstadoPedido.PENDIENTE, usuario, "Pedido creado");
        if (descuento.compareTo(BigDecimal.ZERO) > 0 && guardado.getCuponCodigo() != null && calculoCupon != null) {
            cuponService.registrarUso(calculoCupon.cupon(), usuario, guardado, descuento);
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

    private Map<Long, Integer> agruparItemsPedido(List<PedidoDtos.ItemRequest> items) {
        Map<Long, Integer> cantidades = new LinkedHashMap<>();
        if (items == null) return cantidades;
        for (PedidoDtos.ItemRequest item : items) {
            if (item == null || item.productoId() == null || item.cantidad() == null || item.cantidad() <= 0) continue;
            cantidades.merge(item.productoId(), item.cantidad(), Integer::sum);
        }
        return cantidades;
    }


    private BigDecimal calcularCostoEnvio(BigDecimal subtotalPedido) {
        BigDecimal costoConfigurado = systemConfigService.obtenerDecimal(SystemConfigService.COSTO_ENVIO, new BigDecimal("8.00"));
        if (costoConfigurado.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
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
    public EstadisticasDtos.EstadisticasVendedorResponse obtenerEstadisticasVendedor(AuthTokenService.TokenData actor, Long vendedorId, int diasGrafico) {
        if (actor.rol() == Rol.VENDEDOR && !actor.usuarioId().equals(vendedorId)) {
            throw new SecurityException("No autorizado para ver estas estadísticas");
        }
        if (actor.rol() == Rol.CLIENTE) {
            throw new SecurityException("No autorizado para ver estas estadísticas");
        }

        int rango = diasGrafico <= 0 ? 14 : Math.min(diasGrafico, 90);
        List<Pedido> pedidos = pedidoRepository.findByVendedorIdOrderByFechaDesc(vendedorId);

        LocalDate hoy = LocalDate.now();
        LocalDate inicioSemana = hoy.minusDays(6);
        LocalDate inicioMes = hoy.withDayOfMonth(1);

        BigDecimal ventasHoy = BigDecimal.ZERO;
        BigDecimal ventasSemana = BigDecimal.ZERO;
        BigDecimal ventasMes = BigDecimal.ZERO;
        BigDecimal ventasTotal = BigDecimal.ZERO;
        long pedidosHoy = 0;
        long pedidosSemana = 0;
        long pedidosMes = 0;
        long pedidosValidos = 0;
        long unidadesVendidas = 0;

        Map<LocalDate, BigDecimal> ventasPorDiaMap = new LinkedHashMap<>();
        Map<LocalDate, Long> pedidosPorDiaMap = new LinkedHashMap<>();
        for (int i = rango - 1; i >= 0; i--) {
            LocalDate dia = hoy.minusDays(i);
            ventasPorDiaMap.put(dia, BigDecimal.ZERO);
            pedidosPorDiaMap.put(dia, 0L);
        }

        Map<Long, String> nombreProducto = new LinkedHashMap<>();
        Map<Long, Long> unidadesPorProducto = new LinkedHashMap<>();
        Map<Long, BigDecimal> totalPorProducto = new LinkedHashMap<>();

        Map<EstadoPedido, Long> cantidadPorEstado = new EnumMap<>(EstadoPedido.class);
        Map<EstadoPedido, BigDecimal> totalPorEstado = new EnumMap<>(EstadoPedido.class);
        for (EstadoPedido estado : EstadoPedido.values()) {
            cantidadPorEstado.put(estado, 0L);
            totalPorEstado.put(estado, BigDecimal.ZERO);
        }

        for (Pedido pedido : pedidos) {
            List<PedidoItem> itemsVendedor = pedido.getItems().stream()
                    .filter(i -> i.getVendedor() != null && i.getVendedor().getId().equals(vendedorId))
                    .toList();
            if (itemsVendedor.isEmpty()) continue;

            BigDecimal totalPedidoVendedor = itemsVendedor.stream()
                    .map(i -> i.getSubtotal() == null ? BigDecimal.ZERO : i.getSubtotal())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long unidadesPedido = itemsVendedor.stream()
                    .mapToLong(i -> i.getCantidad() == null ? 0 : i.getCantidad())
                    .sum();
            LocalDate fechaPedido = pedido.getFecha() != null ? pedido.getFecha().toLocalDate() : hoy;
            EstadoPedido estado = pedido.getEstado() != null ? pedido.getEstado() : EstadoPedido.PENDIENTE;

            cantidadPorEstado.merge(estado, 1L, Long::sum);
            totalPorEstado.merge(estado, totalPedidoVendedor, BigDecimal::add);

            boolean cancelado = estado == EstadoPedido.CANCELADO;
            if (cancelado) continue;

            pedidosValidos++;
            ventasTotal = ventasTotal.add(totalPedidoVendedor);
            unidadesVendidas += unidadesPedido;

            if (!fechaPedido.isBefore(hoy)) {
                ventasHoy = ventasHoy.add(totalPedidoVendedor);
                pedidosHoy++;
            }
            if (!fechaPedido.isBefore(inicioSemana)) {
                ventasSemana = ventasSemana.add(totalPedidoVendedor);
                pedidosSemana++;
            }
            if (!fechaPedido.isBefore(inicioMes)) {
                ventasMes = ventasMes.add(totalPedidoVendedor);
                pedidosMes++;
            }
            if (ventasPorDiaMap.containsKey(fechaPedido)) {
                ventasPorDiaMap.merge(fechaPedido, totalPedidoVendedor, BigDecimal::add);
                pedidosPorDiaMap.merge(fechaPedido, 1L, Long::sum);
            }

            for (PedidoItem item : itemsVendedor) {
                Long productoId = item.getProducto() != null ? item.getProducto().getId() : null;
                if (productoId == null) continue;
                nombreProducto.putIfAbsent(productoId, item.getProductoNombre());
                long cantidad = item.getCantidad() == null ? 0 : item.getCantidad();
                BigDecimal subtotal = item.getSubtotal() == null ? BigDecimal.ZERO : item.getSubtotal();
                unidadesPorProducto.merge(productoId, cantidad, Long::sum);
                totalPorProducto.merge(productoId, subtotal, BigDecimal::add);
            }
        }

        BigDecimal ticketPromedio = pedidosValidos == 0
                ? BigDecimal.ZERO
                : ventasTotal.divide(BigDecimal.valueOf(pedidosValidos), 2, RoundingMode.HALF_UP);

        EstadisticasDtos.ResumenVentas resumen = new EstadisticasDtos.ResumenVentas(
                escala(ventasHoy), escala(ventasSemana), escala(ventasMes), escala(ventasTotal),
                pedidosHoy, pedidosSemana, pedidosMes, pedidosValidos, unidadesVendidas, escala(ticketPromedio)
        );

        List<EstadisticasDtos.VentaPorDia> ventasPorDia = new ArrayList<>();
        for (Map.Entry<LocalDate, BigDecimal> entrada : ventasPorDiaMap.entrySet()) {
            ventasPorDia.add(new EstadisticasDtos.VentaPorDia(
                    entrada.getKey(), escala(entrada.getValue()), pedidosPorDiaMap.getOrDefault(entrada.getKey(), 0L)
            ));
        }

        List<EstadisticasDtos.ProductoTop> topProductos = unidadesPorProducto.entrySet().stream()
                .map(entrada -> new EstadisticasDtos.ProductoTop(
                        entrada.getKey(),
                        nombreProducto.getOrDefault(entrada.getKey(), "Producto"),
                        entrada.getValue(),
                        escala(totalPorProducto.getOrDefault(entrada.getKey(), BigDecimal.ZERO))
                ))
                .sorted(Comparator.comparing(EstadisticasDtos.ProductoTop::totalVentas).reversed())
                .limit(5)
                .toList();

        List<EstadisticasDtos.VentaPorEstado> porEstado = new ArrayList<>();
        for (EstadoPedido estado : EstadoPedido.values()) {
            long cantidad = cantidadPorEstado.getOrDefault(estado, 0L);
            if (cantidad == 0) continue;
            porEstado.add(new EstadisticasDtos.VentaPorEstado(estado, cantidad, escala(totalPorEstado.getOrDefault(estado, BigDecimal.ZERO))));
        }
    
        List<CuponUso> usosCupon = cuponUsoRepository.findByCupon_VendedorIdOrderByFechaDesc(vendedorId);
        Map<String, String> descripcionPorCodigo = new LinkedHashMap<>();
        Map<String, Long> usosPorCodigo = new LinkedHashMap<>();
        Map<String, BigDecimal> descuentoPorCodigo = new LinkedHashMap<>();
        Map<String, java.util.Set<Long>> clientesPorCodigo = new LinkedHashMap<>();
        for (CuponUso uso : usosCupon) {
            if (uso.getCupon() == null) continue;
            String codigo = uso.getCupon().getCodigo();
            descripcionPorCodigo.putIfAbsent(codigo, uso.getCupon().getDescripcion());
            usosPorCodigo.merge(codigo, 1L, Long::sum);
            BigDecimal descuento = uso.getDescuentoAplicado() == null ? BigDecimal.ZERO : uso.getDescuentoAplicado();
            descuentoPorCodigo.merge(codigo, descuento, BigDecimal::add);
            if (uso.getUsuario() != null) {
                clientesPorCodigo.computeIfAbsent(codigo, k -> new java.util.HashSet<>()).add(uso.getUsuario().getId());
            }
        }
        List<EstadisticasDtos.CuponUsoResumen> cupones = usosPorCodigo.entrySet().stream()
                .map(entrada -> new EstadisticasDtos.CuponUsoResumen(
                        entrada.getKey(),
                        descripcionPorCodigo.getOrDefault(entrada.getKey(), ""),
                        entrada.getValue(),
                        escala(descuentoPorCodigo.getOrDefault(entrada.getKey(), BigDecimal.ZERO)),
                        clientesPorCodigo.getOrDefault(entrada.getKey(), java.util.Set.of()).size()
                ))
                .sorted(Comparator.comparing(EstadisticasDtos.CuponUsoResumen::usos).reversed())
                .toList();

        return new EstadisticasDtos.EstadisticasVendedorResponse(resumen, ventasPorDia, topProductos, porEstado, cupones);
    }

    private BigDecimal escala(BigDecimal valor) {
        return (valor == null ? BigDecimal.ZERO : valor).setScale(2, RoundingMode.HALF_UP);
    }
}
