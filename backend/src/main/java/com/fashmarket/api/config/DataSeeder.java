package com.fashmarket.api.config;

import com.fashmarket.api.model.*;
import com.fashmarket.api.repository.BannerRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import com.fashmarket.api.service.PasswordService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {
    private final ProductoRepository productoRepository;
    private final BannerRepository bannerRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordService passwordService;

    @Value("${app.admin.nombre:Administrador}")
    private String adminNombre;
    @Value("${app.admin.correo:admin@fastmarket.com}")
    private String adminCorreo;
    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public DataSeeder(ProductoRepository productoRepository, BannerRepository bannerRepository, UsuarioRepository usuarioRepository, PasswordService passwordService) {
        this.productoRepository = productoRepository;
        this.bannerRepository = bannerRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordService = passwordService;
    }

    @Override
    public void run(String... args) {
        crearAdmin();
        crearProductos();
        crearBanners();
    }

    private void crearAdmin() {
        Usuario admin = usuarioRepository.findByCorreoIgnoreCase(adminCorreo).orElse(null);
        if (admin == null) {
            admin = new Usuario(adminNombre, adminCorreo.toLowerCase(), passwordService.encriptar(adminPassword), Rol.ADMIN);
            admin.setEstado(EstadoUsuario.ACTIVO);
            usuarioRepository.save(admin);
            return;
        }

        if (!passwordService.esHashBcrypt(admin.getPassword())) {
            admin.setPassword(passwordService.encriptar(admin.getPassword()));
            usuarioRepository.save(admin);
        }
    }

    private void crearProductos() {
        if (productoRepository.count() > 0) return;

        productoRepository.save(new Producto("Audífonos inalámbricos", "tecnologia", new BigDecimal("79.90"), new BigDecimal("99.90"), 12, "img/productos/audifonos.png", "Audífonos cómodos para música, clases y llamadas.", true, true));
        productoRepository.save(new Producto("Smartwatch básico", "tecnologia", new BigDecimal("99.90"), new BigDecimal("129.90"), 8, "img/productos/smartwatch.png", "Reloj inteligente para uso diario.", true, true));
        productoRepository.save(new Producto("Casaca ligera", "moda", new BigDecimal("119.90"), new BigDecimal("149.90"), 6, "img/productos/casaca.png", "Casaca cómoda y fácil de combinar.", true, true));
        productoRepository.save(new Producto("Lámpara LED", "hogar", new BigDecimal("39.90"), new BigDecimal("49.90"), 15, "img/productos/lampara.png", "Ideal para escritorio, dormitorio o sala.", true, false));
        productoRepository.save(new Producto("Mochila compacta", "accesorios", new BigDecimal("69.90"), null, 10, "img/productos/mochila.png", "Mochila ligera para clases o uso diario.", false, true));
    }

    private void crearBanners() {
        if (bannerRepository.count() > 0) return;
        bannerRepository.save(new Banner("Ofertas disponibles", "Promociones destacadas para tus compras.", "img/fondo1.png", true));
        bannerRepository.save(new Banner("Productos destacados", "Encuentra novedades y descuentos especiales.", "img/abrir.png", true));
        bannerRepository.save(new Banner("Compra segura", "Atención rápida y seguimiento de pedidos.", "img/intro.png", true));
    }
}
