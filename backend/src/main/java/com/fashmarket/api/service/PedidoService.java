package com.fashmarket.api.service;

import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.*;
import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, UsuarioRepository usuarioRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
    }

    public List<PedidoDtos.PedidoResponse> listarTodos() {
        return pedidoRepository.findAll().stream().map(DtoMapper::toPedidoResponse).toList();
    }

    public List<PedidoDtos.PedidoResponse> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByIdDesc(usuarioId).stream().map(DtoMapper::toPedidoResponse).toList();
    }

    @Transactional
    public PedidoDtos.PedidoResponse crear(Long usuarioId, PedidoDtos.CrearPedidoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setCodigo("P" + System.currentTimeMillis());
        pedido.setFecha(LocalDate.now());
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setMetodo(request.metodo());
        pedido.setDireccion(request.direccion());
        pedido.setReferencia(request.referencia());
        pedido.setHorario(request.horario());
        pedido.setEntregaEstimada("Pendiente de confirmación");

        BigDecimal total = BigDecimal.ZERO;

        for (PedidoDtos.ItemRequest itemRequest : request.productos()) {
            Producto producto = productoRepository.findById(itemRequest.productoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + itemRequest.productoId()));

            if (producto.getStock() < itemRequest.cantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - itemRequest.cantidad());
            productoRepository.save(producto);

            PedidoItem item = new PedidoItem();
            item.setProductoId(producto.getId());
            item.setNombre(producto.getNombre());
            item.setCantidad(itemRequest.cantidad());
            item.setPrecio(producto.getPrecio());
            pedido.agregarItem(item);

            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(itemRequest.cantidad())));
        }

        BigDecimal envio = BigDecimal.valueOf(8.00);
        pedido.setTotal(total.add(envio));

        Pedido guardado = pedidoRepository.save(pedido);
        return DtoMapper.toPedidoResponse(guardado);
    }

    @Transactional
    public PedidoDtos.PedidoResponse actualizarEstado(Long pedidoId, EstadoPedido estado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado"));

        pedido.setEstado(estado);
        pedido.setEntregaEstimada(entregaPorEstado(estado));
        return DtoMapper.toPedidoResponse(pedidoRepository.save(pedido));
    }

    private String entregaPorEstado(EstadoPedido estado) {
        return switch (estado) {
            case PENDIENTE -> "Pendiente de confirmación";
            case CAMINO -> "Pedido en camino";
            case REPARTO -> "En reparto hacia tu dirección";
            case ENTREGADO -> "Entregado";
            case CANCELADO -> "Pedido cancelado";
        };
    }
}
