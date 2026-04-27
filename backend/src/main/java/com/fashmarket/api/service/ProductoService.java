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

    public List<Producto> listar(Boolean oferta, Boolean destacado) {
        if (Boolean.TRUE.equals(oferta) && Boolean.TRUE.equals(destacado)) {
            return productoRepository.findByOfertaTrueAndDestacadoTrue();
        }
        if (Boolean.TRUE.equals(oferta)) {
            return productoRepository.findByOfertaTrue();
        }
        if (Boolean.TRUE.equals(destacado)) {
            return productoRepository.findByDestacadoTrue();
        }
        return productoRepository.findAll();
    }

    public Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
    }

    @Transactional
    public Producto crear(ProductoRequest request) {
        Producto producto = new Producto();
        aplicarDatos(producto, request);
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(Long id, ProductoRequest request) {
        Producto producto = obtener(id);
        aplicarDatos(producto, request);
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    private void aplicarDatos(Producto producto, ProductoRequest request) {
        producto.setNombre(request.nombre());
        producto.setCategoria(request.categoria());
        producto.setPrecio(request.precio());
        producto.setPrecioAntes(request.precioAntes());
        producto.setStock(request.stock());
        producto.setImagen(request.imagen());
        producto.setDescripcion(request.descripcion());
        producto.setOferta(Boolean.TRUE.equals(request.oferta()));
        producto.setDestacado(Boolean.TRUE.equals(request.destacado()));
    }
}
