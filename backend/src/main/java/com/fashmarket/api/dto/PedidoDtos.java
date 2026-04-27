package com.fashmarket.api.dto;

import com.fashmarket.api.model.EstadoPedido;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoDtos {
    public record ItemRequest(@NotNull Long productoId, @NotNull @Positive Integer cantidad) {}
    public record CrearPedidoRequest(String direccionEntrega, @NotEmpty List<ItemRequest> items) {}
    public record ItemResponse(Long productoId, String productoNombre, Integer cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {}
    public record PedidoResponse(Long id, String codigo, Long usuarioId, String usuarioNombre, BigDecimal total, EstadoPedido estado, String direccionEntrega, LocalDateTime fecha, List<ItemResponse> items) {}
}
