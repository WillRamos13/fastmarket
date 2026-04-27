package com.fashmarket.api.service;

import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.*;
import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
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

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<PedidoDtos.PedidoResponse> listar() {
        return pedidoRepository.findAllByOrderByFechaDesc().stream().map(DtoMapper::toPedidoResponse).toList();
    }

    public List<PedidoDtos.PedidoResponse> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream().map(DtoMapper::toPedidoResponse).toList();
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

            if (!Boolean.TRUE.equals(producto.getActivo())) {
                throw new IllegalArgumentException("El producto " + producto.getNombre() + " ya no está disponible");
            }

            int cantidad = itemRequest.cantidad();
            if (cantidad <= 0) throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            if (producto.getStock() < cantidad) {
                throw new IllegalArgumentException("Stock insuficiente para " + producto.getNombre() + ". Stock actual: " + producto.getStock());
            }

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

            pedido.getItems().add(item);
            subtotalPedido = subtotalPedido.add(subtotalItem);
        }

        BigDecimal costoEnvio = request.costoEnvio() == null ? BigDecimal.ZERO : request.costoEnvio();
        if (costoEnvio.compareTo(BigDecimal.ZERO) < 0) costoEnvio = BigDecimal.ZERO;

        pedido.setSubtotal(subtotalPedido);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setTotal(subtotalPedido.add(costoEnvio));

        return DtoMapper.toPedidoResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDtos.PedidoResponse actualizarEstado(Long id, EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        pedido.setEstado(estado);
        return DtoMapper.toPedidoResponse(pedidoRepository.save(pedido));
    }

    private String valor(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }
}
