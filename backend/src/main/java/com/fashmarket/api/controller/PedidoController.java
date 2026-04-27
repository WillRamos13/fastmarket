package com.fashmarket.api.controller;

import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.EstadoPedido;
import com.fashmarket.api.service.AuthTokenService;
import com.fashmarket.api.service.PedidoService;
import jakarta.validation.Valid;
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
        authTokenService.requerirAdmin(authorization);
        return pedidoService.listar();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<PedidoDtos.PedidoResponse> listarPorUsuario(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long usuarioId
    ) {
        authTokenService.requerirUsuarioOAdmin(authorization, usuarioId);
        return pedidoService.listarPorUsuario(usuarioId);
    }

    @PostMapping("/usuario/{usuarioId}")
    public PedidoDtos.PedidoResponse crear(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long usuarioId,
            @Valid @RequestBody PedidoDtos.CrearPedidoRequest request
    ) {
        authTokenService.requerirUsuarioOAdmin(authorization, usuarioId);
        return pedidoService.crear(usuarioId, request);
    }

    @PutMapping("/{pedidoId}/estado")
    public PedidoDtos.PedidoResponse actualizarEstado(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long pedidoId,
            @RequestParam EstadoPedido estado
    ) {
        authTokenService.requerirAdmin(authorization);
        return pedidoService.actualizarEstado(pedidoId, estado);
    }
}
