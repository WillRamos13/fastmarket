package com.fashmarket.api.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatDtos {
    public record ChatRequest(
            @NotBlank(message = "El mensaje no puede estar vacío")
            String mensaje
    ) {}

    public record ChatResponse(
            String respuesta,
            boolean usandoIa,
            boolean usandoDatosReales
    ) {}
}
