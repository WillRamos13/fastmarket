package com.fashmarket.api.service;

import com.fashmarket.api.dto.ProductoRequest;
import com.fashmarket.api.model.Producto;
import com.fashmarket.api.model.Rol;
import com.fashmarket.api.model.Usuario;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProductoService(ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Page<Producto> listarPaginado(AuthTokenService.TokenData actor, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), Sort.by(Sort.Direction.DESC, "id"));
        if (actor.rol() == Rol.VENDEDOR) {
            return productoRepository.findByVendedorId(actor.usuarioId(), pageable);
        }
        return productoRepository.findAll(pageable);
    }

    public List<Producto> listar(Boolean oferta, Boolean destacado, Boolean incluirInactivos) {
        if (Boolean.TRUE.equals(incluirInactivos)) return productoRepository.findAll();
        if (Boolean.TRUE.equals(oferta) && Boolean.TRUE.equals(destacado)) return productoRepository.findByActivoTrueAndOfertaTrueAndDestacadoTrueOrderByIdDesc();
        if (Boolean.TRUE.equals(oferta)) return productoRepository.findByActivoTrueAndOfertaTrueOrderByIdDesc();
        if (Boolean.TRUE.equals(destacado)) return productoRepository.findByActivoTrueAndDestacadoTrueOrderByIdDesc();
        return productoRepository.findByActivoTrueOrderByIdDesc();
    }

    public List<Producto> listarParaPanel(AuthTokenService.TokenData actor, Boolean incluirInactivos) {
        if (actor.rol() == Rol.VENDEDOR) {
            return Boolean.TRUE.equals(incluirInactivos)
                    ? productoRepository.findByVendedorIdOrderByIdDesc(actor.usuarioId())
                    : productoRepository.findByVendedorIdAndActivoTrueOrderByIdDesc(actor.usuarioId());
        }
        return Boolean.TRUE.equals(incluirInactivos) ? productoRepository.findAll() : productoRepository.findByActivoTrueOrderByIdDesc();
    }

    public List<Producto> listarPorVendedor(Long vendedorId) {
        return productoRepository.findByVendedorIdOrderByIdDesc(vendedorId);
    }

    public Producto obtener(Long id) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        if (!Boolean.TRUE.equals(producto.getActivo())) throw new IllegalArgumentException("Producto no disponible");
        return producto;
    }

    @Transactional
    public Producto crear(AuthTokenService.TokenData actor, ProductoRequest request) {
        Producto producto = new Producto();
        producto.setActivo(true);
        aplicarDatos(producto, actor, request);
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(AuthTokenService.TokenData actor, Long id, ProductoRequest request) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        validarPropietarioOVendedor(actor, producto);
        producto.setActivo(true);
        aplicarDatos(producto, actor, request);
        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminar(AuthTokenService.TokenData actor, Long id) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        validarPropietarioOVendedor(actor, producto);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    private void aplicarDatos(Producto producto, AuthTokenService.TokenData actor, ProductoRequest request) {
        producto.setNombre(request.nombre().trim());
        producto.setCategoria(request.categoria().trim());
        producto.setPrecio(request.precio());
        producto.setPrecioAntes(request.precioAntes());
        producto.setStock(request.stock());
        producto.setImagen(request.imagen() == null || request.imagen().isBlank() ? "img/logo.png" : request.imagen());
        producto.setDescripcion(request.descripcion() == null ? "" : request.descripcion().trim());
        producto.setOferta(Boolean.TRUE.equals(request.oferta()));
        producto.setDestacado(Boolean.TRUE.equals(request.destacado()));

        if (actor.rol() == Rol.VENDEDOR) {
            Usuario vendedor = usuarioRepository.findById(actor.usuarioId()).orElseThrow(() -> new IllegalArgumentException("Vendedor no encontrado"));
            producto.setVendedor(vendedor);
            return;
        }

        if (request.vendedorId() != null) {
            Usuario vendedor = usuarioRepository.findById(request.vendedorId()).orElseThrow(() -> new IllegalArgumentException("Vendedor no encontrado"));
            if (vendedor.getRol() != Rol.VENDEDOR) throw new IllegalArgumentException("El usuario seleccionado no es vendedor");
            producto.setVendedor(vendedor);
        } else if (producto.getVendedor() == null) {
            producto.setVendedor(null);
        }
    }

    private void validarPropietarioOVendedor(AuthTokenService.TokenData actor, Producto producto) {
        if (actor.rol() == Rol.ADMIN) return;
        Long vendedorId = producto.getVendedor() != null ? producto.getVendedor().getId() : null;
        if (actor.rol() == Rol.VENDEDOR && vendedorId != null && vendedorId.equals(actor.usuarioId())) return;
        throw new SecurityException("No autorizado para modificar este producto");
    }
}
