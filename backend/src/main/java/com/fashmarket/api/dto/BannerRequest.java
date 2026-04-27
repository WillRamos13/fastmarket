package com.fashmarket.api.dto;

import jakarta.validation.constraints.NotBlank;

public record BannerRequest(
        @NotBlank String titulo,
        @NotBlank String descripcion,
        @NotBlank String imagen,
        Boolean activo
) {}
