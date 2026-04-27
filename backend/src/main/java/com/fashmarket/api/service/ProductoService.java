package com.fashmarket.api.service;

import com.fashmarket.api.dto.ProductoRequest;
import com.fashmarket.api.model.Producto;
import com.fashmarket.api.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listar(Boolean oferta, Boolean destacado, Boolean incluirInactivos) {
        if (Boolean.TRUE.equals(incluirInactivos)) {
            return productoRepository.findAll();
        }
        if (Boolean.TRUE.equals(oferta) && Boolean.TRUE.equals(destacado)) {
            return productoRepository.findByActivoTrueAndOfertaTrueAndDestacadoTrueOrderByIdDesc();
        }
        if (Boolean.TRUE.equals(oferta)) {
            return productoRepository.findByActivoTrueAndOfertaTrueOrderByIdDesc();
        }
        if (Boolean.TRUE.equals(destacado)) {
            return productoRepository.findByActivoTrueAndDestacadoTrueOrderByIdDesc();
        }
        return productoRepository.findByActivoTrueOrderByIdDesc();
    }

    public Producto obtener(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        if (!Boolean.TRUE.equals(producto.getActivo())) {
            throw new IllegalArgumentException("Producto no disponible");
        }
        return producto;
    }

    @Transactional
    public Producto crear(ProductoRequest request) {
        Producto producto = new Producto();
        producto.setActivo(true);
        aplicarDatos(producto, request);
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(Long id, ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        producto.setActivo(true);
        aplicarDatos(producto, request);
        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    private void aplicarDatos(Producto producto, ProductoRequest request) {
        producto.setNombre(request.nombre().trim());
        producto.setCategoria(request.categoria().trim());
        producto.setPrecio(request.precio());
        producto.setPrecioAntes(request.precioAntes());
        producto.setStock(request.stock());
        producto.setImagen(request.imagen() == null || request.imagen().isBlank() ? "img/logo.png" : request.imagen());
        producto.setDescripcion(request.descripcion() == null ? "" : request.descripcion().trim());
        producto.setOferta(Boolean.TRUE.equals(request.oferta()));
        producto.setDestacado(Boolean.TRUE.equals(request.destacado()));
    }
}
