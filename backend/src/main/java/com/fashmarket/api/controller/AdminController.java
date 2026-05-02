package com.fashmarket.api.controller;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.model.Rol;
import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import com.fashmarket.api.service.AuthTokenService;
import com.fashmarket.api.service.DtoMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);

        if (actor.rol() == Rol.VENDEDOR) {
            long totalProductos = productoRepository.countByVendedorIdAndActivoTrue(actor.usuarioId());
            long totalOfertas = productoRepository.countByVendedorIdAndActivoTrueAndOfertaTrue(actor.usuarioId());
            long totalStock = productoRepository.sumarStockTotalActivoPorVendedor(actor.usuarioId());
            long totalPedidos = pedidoRepository.countByVendedorId(actor.usuarioId());
            return Map.of(
                    "totalProductos", totalProductos,
                    "totalOfertas", totalOfertas,
                    "totalStock", totalStock,
                    "totalPedidos", totalPedidos,
                    "totalUsuarios", 0,
                    "totalVendedores", 0
            );
        }

        long totalProductos = productoRepository.countByActivoTrue();
        long totalOfertas = productoRepository.countByActivoTrueAndOfertaTrue();
        long totalStock = productoRepository.sumarStockTotalActivo();
        long totalPedidos = pedidoRepository.count();
        long totalUsuarios = usuarioRepository.count();
        long totalVendedores = usuarioRepository.findByRolOrderByNombreAsc(Rol.VENDEDOR).size();

        return Map.of(
                "totalProductos", totalProductos,
                "totalOfertas", totalOfertas,
                "totalStock", totalStock,
                "totalPedidos", totalPedidos,
                "totalUsuarios", totalUsuarios,
                "totalVendedores", totalVendedores
        );
    }

    @GetMapping("/vendedores")
    public List<AuthDtos.UsuarioResponse> vendedores(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authTokenService.requerirAdmin(authorization);
        return usuarioRepository.findByRolOrderByNombreAsc(Rol.VENDEDOR).stream().map(DtoMapper::toUsuarioResponse).toList();
    }
}
