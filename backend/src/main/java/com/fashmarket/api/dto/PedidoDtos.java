package com.fashmarket.api.dto;

import com.fashmarket.api.model.EstadoPedido;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoDtos {
    public record ItemRequest(
            @NotNull Long productoId,
            @NotNull @Positive Integer cantidad
    ) {}

    public record CrearPedidoRequest(
            String direccionEntrega,
            String referenciaEntrega,
            String horarioEntrega,
            String metodoPago,
            String telefonoEntrega,
            @PositiveOrZero BigDecimal costoEnvio,
            String cuponCodigo,
            @NotEmpty List<ItemRequest> items
    ) {}

    public record ItemResponse(
            Long productoId,
            String productoNombre,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal,
            String imagen
    ) {}

    public record HistorialResponse(
            Long id,
            EstadoPedido estadoAnterior,
            EstadoPedido estadoNuevo,
            String actorNombre,
            String motivo,
            LocalDateTime fecha
    ) {}

    public record PedidoResponse(
            Long id,
            String codigo,
            Long usuarioId,
            String usuarioNombre,
            BigDecimal subtotal,
            BigDecimal costoEnvio,
            BigDecimal total,
            BigDecimal descuento,
            String cuponCodigo,
            EstadoPedido estado,
            String direccionEntrega,
            String referenciaEntrega,
            String horarioEntrega,
            String metodoPago,
            String telefonoEntrega,
            LocalDateTime fecha,
            List<ItemResponse> items
    ) {}
}
