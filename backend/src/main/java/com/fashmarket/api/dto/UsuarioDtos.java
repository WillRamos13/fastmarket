package com.fashmarket.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsuarioDtos {
    public record ActualizarUsuarioRequest(
            @NotBlank String nombre,
            @Email @NotBlank String correo,
            @NotBlank String telefono
    ) {}

    public record AgregarDireccionRequest(@NotBlank String direccion) {}

    public record CambiarPasswordRequest(
            @NotBlank String actual,
            @Size(min = 6) String nueva
    ) {}
}
