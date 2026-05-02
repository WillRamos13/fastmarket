package com.fashmarket.api.service;

import com.fashmarket.api.dto.CarritoDtos;
import com.fashmarket.api.dto.CuponDtos;
import com.fashmarket.api.model.*;
import com.fashmarket.api.repository.CarritoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CarritoService {
    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final CuponService cuponService;

    public CarritoService(CarritoRepository carritoRepository, UsuarioRepository usuarioRepository, ProductoRepository productoRepository, CuponService cuponService) {
        this.carritoRepository = carritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.cuponService = cuponService;
    }

    @Transactional(readOnly = true)
    public CarritoDtos.CarritoResponse obtener(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId).orElse(null);
        if (carrito == null) return respuestaVacia(usuarioId);
        return toResponse(carrito);
    }

    @Transactional
    public CarritoDtos.CarritoResponse sincronizar(Long usuarioId, CarritoDtos.SincronizarCarritoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
            Carrito c = new Carrito();
            c.setUsuario(usuario);
            return c;
        });

        carrito.getItems().clear();
        List<CarritoDtos.CarritoItemRequest> items = request == null || request.items() == null ? List.of() : request.items();
        for (CarritoDtos.CarritoItemRequest itemRequest : items) {
            if (itemRequest.productoId() == null || itemRequest.cantidad() == null || itemRequest.cantidad() <= 0) continue;
            Producto producto = productoRepository.findById(itemRequest.productoId()).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
            if (!Boolean.TRUE.equals(producto.getActivo())) continue;
            int cantidad = Math.min(itemRequest.cantidad(), Math.max(0, producto.getStock()));
            if (cantidad <= 0) continue;
            CarritoItem item = new CarritoItem();
            item.setCarrito(carrito);
            item.setProducto(producto);
            item.setCantidad(cantidad);
            item.setPrecioUnitario(producto.getPrecio());
            carrito.getItems().add(item);
        }
        String cupon = request == null ? null : request.cuponCodigo();
        carrito.setCuponCodigo(cupon == null || cupon.isBlank() ? null : cupon.trim().toUpperCase());
        carrito.setActualizadoEn(LocalDateTime.now());
        return toResponse(carritoRepository.save(carrito));
    }

    @Transactional
    public void limpiar(Long usuarioId) {
        carritoRepository.findByUsuarioId(usuarioId).ifPresent(carrito -> {
            carrito.getItems().clear();
            carrito.setCuponCodigo(null);
            carrito.setActualizadoEn(LocalDateTime.now());
            carritoRepository.save(carrito);
        });
    }

    private CarritoDtos.CarritoResponse toResponse(Carrito carrito) {
        List<CarritoDtos.CarritoItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CarritoItem item : carrito.getItems()) {
            Producto p = item.getProducto();
            BigDecimal precio = p != null ? p.getPrecio() : item.getPrecioUnitario();
            BigDecimal itemSubtotal = precio.multiply(BigDecimal.valueOf(item.getCantidad())).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);
            items.add(new CarritoDtos.CarritoItemResponse(
                    p != null ? p.getId() : null,
                    p != null ? p.getNombre() : "Producto",
                    p != null ? p.getImagen() : null,
                    precio,
                    item.getCantidad(),
                    itemSubtotal,
                    p != null ? p.getStock() : 0
            ));
        }
        BigDecimal descuento = BigDecimal.ZERO;
        if (carrito.getCuponCodigo() != null && !carrito.getCuponCodigo().isBlank() && !items.isEmpty()) {
            try {
                List<CuponDtos.AplicarCuponItemRequest> itemsCupon = items.stream()
                        .map(i -> new CuponDtos.AplicarCuponItemRequest(i.productoId(), i.cantidad()))
                        .toList();
                descuento = cuponService.calcularDescuento(carrito.getCuponCodigo(), itemsCupon).descuento();
            } catch (RuntimeException ignored) {
                descuento = BigDecimal.ZERO;
            }
        }
        BigDecimal total = subtotal.subtract(descuento);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        return new CarritoDtos.CarritoResponse(carrito.getUsuario().getId(), carrito.getCuponCodigo(), subtotal, descuento, total, carrito.getActualizadoEn(), items);
    }

    private CarritoDtos.CarritoResponse respuestaVacia(Long usuarioId) {
        return new CarritoDtos.CarritoResponse(usuarioId, null, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, LocalDateTime.now(), List.of());
    }
}
