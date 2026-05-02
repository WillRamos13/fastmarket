package com.fashmarket.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank String nombre,
        @NotBlank String categoria,
        @NotNull @Positive BigDecimal precio,
        BigDecimal precioAntes,
        @NotNull @PositiveOrZero Integer stock,
        String imagen,
        String descripcion,
        Boolean oferta,
        Boolean destacado,
        Long vendedorId
) {}
