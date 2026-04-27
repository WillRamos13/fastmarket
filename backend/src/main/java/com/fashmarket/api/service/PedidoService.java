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
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setCodigo("PED-" + System.currentTimeMillis());
        pedido.setDireccionEntrega(request.direccionEntrega());
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado(EstadoPedido.PENDIENTE);

        BigDecimal total = BigDecimal.ZERO;

        for (PedidoDtos.ItemRequest itemRequest : request.items()) {
            Producto producto = productoRepository.findById(itemRequest.productoId()).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
            int cantidad = itemRequest.cantidad();
            if (cantidad <= 0) throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            if (producto.getStock() < cantidad) throw new IllegalArgumentException("Stock insuficiente para " + producto.getNombre());

            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);

            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(cantidad));
            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProducto(producto);
            item.setProductoNombre(producto.getNombre());
            item.setCantidad(cantidad);
            item.setPrecioUnitario(producto.getPrecio());
            item.setSubtotal(subtotal);
            pedido.getItems().add(item);
            total = total.add(subtotal);
        }

        pedido.setTotal(total);
        return DtoMapper.toPedidoResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDtos.PedidoResponse actualizarEstado(Long id, EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        pedido.setEstado(estado);
        return DtoMapper.toPedidoResponse(pedidoRepository.save(pedido));
    }
}
