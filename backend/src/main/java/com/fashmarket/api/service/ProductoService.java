package com.fashmarket.api.service;

import com.fashmarket.api.dto.ProductoRequest;
import com.fashmarket.api.model.Producto;
import com.fashmarket.api.repository.ProductoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listar(String categoria) {
        if (categoria != null && !categoria.isBlank() && !categoria.equalsIgnoreCase("todos")) {
            return productoRepository.findByCategoriaIgnoreCase(categoria);
        }
        return productoRepository.findAll();
    }

    public Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));
    }

    public Producto crear(ProductoRequest request) {
        Producto producto = new Producto();
        aplicarDatos(producto, request);
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, ProductoRequest request) {
        Producto producto = obtener(id);
        aplicarDatos(producto, request);
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new EntityNotFoundException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    private void aplicarDatos(Producto producto, ProductoRequest request) {
        producto.setNombre(request.nombre().trim());
        producto.setCategoria(request.categoria().trim().toLowerCase());
        producto.setPrecio(request.precio());
        producto.setPrecioAntes(request.precioAntes());
        producto.setStock(request.stock());
        producto.setImagen(request.imagen() == null || request.imagen().isBlank() ? "img/logo.png" : request.imagen());
        producto.setDescripcion(request.descripcion().trim());
        producto.setOferta(Boolean.TRUE.equals(request.oferta()));
    }
}
