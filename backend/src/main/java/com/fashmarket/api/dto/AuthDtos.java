package com.fashmarket.api.dto;

import com.fashmarket.api.model.EstadoUsuario;
import com.fashmarket.api.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class AuthDtos {

    public record EnviarCodigoRegistroRequest(
            @NotBlank @Email String correo,
            String nombre
    ) {}

    public record RegistroRequest(
            @NotBlank String nombre,
            @NotBlank @Email String correo,
            @NotBlank @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres") String password,
            String telefono,
            String documento,
            String direccion,
            @NotBlank String codigoVerificacion
    ) {}

    public record LoginRequest(
            @NotBlank @Email String correo,
            @NotBlank String password
    ) {}

    public record DireccionResponse(
            Long id,
            String direccion,
            String referencia,
            String distrito,
            String ciudad,
            Boolean principal
    ) {}

    public record SolicitarRecuperacionRequest(
            @NotBlank @Email String correo
    ) {}

    public record RecuperarPasswordRequest(
            @NotBlank @Email String correo,
            @NotBlank String codigoVerificacion,
            @NotBlank @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres") String passwordNueva
    ) {}

    public record UsuarioResponse(
            Long id,
            String nombre,
            String correo,
            String telefono,
            String documento,
            Rol rol,
            EstadoUsuario estado,
            List<DireccionResponse> direcciones
    ) {}

    public record AuthResponse(
            UsuarioResponse usuario,
            String token
    ) {}
}
