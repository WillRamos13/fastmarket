package com.fashmarket.api.controller;

import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.EstadoPedido;
import com.fashmarket.api.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    private final PedidoService pedidoService;
    public PedidoController(PedidoService pedidoService) { this.pedidoService = pedidoService; }
    @GetMapping public List<PedidoDtos.PedidoResponse> listar() { return pedidoService.listar(); }
    @GetMapping("/usuario/{usuarioId}") public List<PedidoDtos.PedidoResponse> listarPorUsuario(@PathVariable Long usuarioId) { return pedidoService.listarPorUsuario(usuarioId); }
    @PostMapping("/usuario/{usuarioId}") public PedidoDtos.PedidoResponse crear(@PathVariable Long usuarioId, @Valid @RequestBody PedidoDtos.CrearPedidoRequest request) { return pedidoService.crear(usuarioId, request); }
    @PutMapping("/{pedidoId}/estado") public PedidoDtos.PedidoResponse actualizarEstado(@PathVariable Long pedidoId, @RequestParam EstadoPedido estado) { return pedidoService.actualizarEstado(pedidoId, estado); }
}
