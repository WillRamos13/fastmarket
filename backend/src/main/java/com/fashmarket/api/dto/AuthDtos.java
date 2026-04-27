package com.fashmarket.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class AuthDtos {
    public record RegistroRequest(
            @NotBlank String nombre,
            @Email @NotBlank String correo,
            @NotBlank String telefono,
            @Size(min = 6) String password,
            String direccion
    ) {}

    public record LoginRequest(
            @Email @NotBlank String correo,
            @NotBlank String password
    ) {}

    public record UsuarioResponse(
            Long id,
            String nombre,
            String correo,
            String telefono,
            String rol,
            String estado,
            List<DireccionResponse> direcciones
    ) {}

    public record DireccionResponse(Long id, String direccion) {}
}
