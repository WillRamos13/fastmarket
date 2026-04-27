package com.fashmarket.api.controller;

import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import com.fashmarket.api.service.AuthTokenService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthTokenService authTokenService;

    public AdminController(ProductoRepository productoRepository, PedidoRepository pedidoRepository, UsuarioRepository usuarioRepository, AuthTokenService authTokenService) {
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.authTokenService = authTokenService;
    }

    @GetMapping("/indices")
    public Map<String, Object> indices(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authTokenService.requerirAdmin(authorization);

        long totalProductos = productoRepository.countByActivoTrue();
        long totalOfertas = productoRepository.countByActivoTrueAndOfertaTrue();
        long totalStock = productoRepository.sumarStockTotalActivo();
        long totalPedidos = pedidoRepository.count();
        long totalUsuarios = usuarioRepository.count();

        return Map.of(
                "totalProductos", totalProductos,
                "totalOfertas", totalOfertas,
                "totalStock", totalStock,
                "totalPedidos", totalPedidos,
                "totalUsuarios", totalUsuarios
        );
    }
}
