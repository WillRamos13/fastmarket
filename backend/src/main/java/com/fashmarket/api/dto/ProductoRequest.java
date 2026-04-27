package com.fashmarket.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank String nombre,
        @NotBlank String categoria,
        @NotNull @DecimalMin("0.01") BigDecimal precio,
        BigDecimal precioAntes,
        @NotNull @Min(0) Integer stock,
        String imagen,
        @NotBlank String descripcion,
        Boolean oferta
) {}
