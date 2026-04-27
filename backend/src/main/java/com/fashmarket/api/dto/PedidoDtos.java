package com.fashmarket.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PedidoDtos {
    public record CrearPedidoRequest(
            @NotBlank String metodo,
            @NotBlank String direccion,
            String referencia,
            String horario,
            @NotEmpty List<ItemRequest> productos
    ) {}

    public record ItemRequest(
            @NotNull Long productoId,
            @NotNull @Min(1) Integer cantidad
    ) {}

    public record PedidoResponse(
            Long id,
            String codigo,
            LocalDate fecha,
            String estado,
            String metodo,
            String direccion,
            String referencia,
            String horario,
            String entregaEstimada,
            BigDecimal total,
            String cliente,
            List<ItemResponse> productos
    ) {}

    public record ItemResponse(
            Long id,
            Long productoId,
            String nombre,
            Integer cantidad,
            BigDecimal precio
    ) {}
}
