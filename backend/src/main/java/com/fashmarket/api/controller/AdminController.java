package com.fashmarket.api.controller;

import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

    public AdminController(ProductoRepository productoRepository, PedidoRepository pedidoRepository, UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/indices")
    public Map<String, Object> indices() {
        long totalProductos = productoRepository.count();
        long totalPedidos = pedidoRepository.count();
        long totalUsuarios = usuarioRepository.count();
        long productosOferta = productoRepository.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getOferta())).count();
        int stockTotal = productoRepository.findAll().stream().mapToInt(p -> p.getStock() == null ? 0 : p.getStock()).sum();

        return Map.of(
                "totalProductos", totalProductos,
                "productosOferta", productosOferta,
                "stockTotal", stockTotal,
                "totalPedidos", totalPedidos,
                "totalUsuarios", totalUsuarios
        );
    }
}
