package com.fashmarket.api.controller;

import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.EstadoPedido;
import com.fashmarket.api.service.AuthTokenService;
import com.fashmarket.api.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    private final PedidoService pedidoService;
    private final AuthTokenService authTokenService;

    public PedidoController(PedidoService pedidoService, AuthTokenService authTokenService) {
        this.pedidoService = pedidoService;
        this.authTokenService = authTokenService;
    }

    @GetMapping
    public List<PedidoDtos.PedidoResponse> listar(@RequestHeader(value = "Authorization", required = false) String authorization) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return pedidoService.listar(actor);
    }

    @GetMapping("/page")
    public Page<PedidoDtos.PedidoResponse> listarPaginado(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return pedidoService.listarPaginado(actor, page, size);
    }

    @GetMapping("/vendedor/{vendedorId}")
    public List<PedidoDtos.PedidoResponse> listarPorVendedor(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long vendedorId) {
        authTokenService.requerirVendedorOAdmin(authorization, vendedorId);
        return pedidoService.listarPorVendedor(vendedorId);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<PedidoDtos.PedidoResponse> listarPorUsuario(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long usuarioId) {
        authTokenService.requerirUsuarioOAdmin(authorization, usuarioId);
        return pedidoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{pedidoId}/historial")
    public List<PedidoDtos.HistorialResponse> historial(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long pedidoId) {
        AuthTokenService.TokenData actor = authTokenService.validar(authorization);
        return pedidoService.historial(actor, pedidoId);
    }

    @PostMapping("/usuario/{usuarioId}")
    public PedidoDtos.PedidoResponse crear(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long usuarioId, @Valid @RequestBody PedidoDtos.CrearPedidoRequest request) {
        authTokenService.requerirUsuarioOAdmin(authorization, usuarioId);
        return pedidoService.crear(usuarioId, request);
    }

    @PutMapping("/{pedidoId}/estado")
    public PedidoDtos.PedidoResponse actualizarEstado(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long pedidoId, @RequestParam EstadoPedido estado) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return pedidoService.actualizarEstado(actor, pedidoId, estado);
    }
}
