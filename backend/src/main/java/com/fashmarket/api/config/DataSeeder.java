package com.fashmarket.api.config;

import com.fashmarket.api.model.*;
import com.fashmarket.api.repository.BannerRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final BannerRepository bannerRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.nombre}") private String adminNombre;
    @Value("${app.admin.correo}") private String adminCorreo;
    @Value("${app.admin.password}") private String adminPassword;

    public DataSeeder(UsuarioRepository usuarioRepository, ProductoRepository productoRepository,
                      BannerRepository bannerRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.bannerRepository = bannerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        crearAdminSiNoExiste();
        crearProductosSiNoExisten();
        crearBannersSiNoExisten();
    }

    private void crearAdminSiNoExiste() {
        if (usuarioRepository.existsByCorreoIgnoreCase(adminCorreo)) return;

        Usuario admin = new Usuario();
        admin.setNombre(adminNombre);
        admin.setCorreo(adminCorreo.toLowerCase());
        admin.setTelefono("999999999");
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRol(Rol.ADMIN);
        admin.setEstado(EstadoUsuario.ACTIVO);

        usuarioRepository.save(admin);
    }

    private void crearProductosSiNoExisten() {
        if (productoRepository.count() > 0) return;

        producto("Audífonos inalámbricos", "tecnologia", "79.90", "99.90", 12, "img/productos/audifonos.png", "Audífonos cómodos para música, clases y llamadas.", true);
        producto("Smartwatch básico", "tecnologia", "99.90", "129.90", 8, "img/productos/smartwatch.png", "Reloj inteligente para uso diario.", true);
        producto("Casaca ligera", "moda", "119.90", "149.90", 6, "img/productos/casaca.png", "Casaca cómoda y fácil de combinar.", true);
        producto("Lámpara LED", "hogar", "39.90", "49.90", 15, "img/productos/lampara.png", "Ideal para escritorio, dormitorio o sala.", true);
        producto("Mochila compacta", "accesorios", "69.90", null, 10, "img/productos/mochila.png", "Mochila ligera para clases o uso diario.", false);
    }

    private void producto(String nombre, String categoria, String precio, String precioAntes, Integer stock, String imagen, String descripcion, Boolean oferta) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setCategoria(categoria);
        p.setPrecio(new BigDecimal(precio));
        p.setPrecioAntes(precioAntes == null ? null : new BigDecimal(precioAntes));
        p.setStock(stock);
        p.setImagen(imagen);
        p.setDescripcion(descripcion);
        p.setOferta(oferta);
        productoRepository.save(p);
    }

    private void crearBannersSiNoExisten() {
        if (bannerRepository.count() > 0) return;

        banner("Ofertas disponibles", "Promociones destacadas para tus compras.", "img/fondo1.png", true);
        banner("Productos destacados", "Encuentra novedades y descuentos especiales.", "img/abrir.png", true);
        banner("Compra segura", "Atención rápida y seguimiento de pedidos.", "img/intro.png", true);
    }

    private void banner(String titulo, String descripcion, String imagen, Boolean activo) {
        Banner b = new Banner();
        b.setTitulo(titulo);
        b.setDescripcion(descripcion);
        b.setImagen(imagen);
        b.setActivo(activo);
        bannerRepository.save(b);
    }
}
