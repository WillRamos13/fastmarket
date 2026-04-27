package com.fashmarket.api.dto;

import com.fashmarket.api.model.EstadoUsuario;
import com.fashmarket.api.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class AuthDtos {
    public record RegistroRequest(@NotBlank String nombre, @NotBlank @Email String correo, @NotBlank String password, String telefono, String documento) {}
    public record LoginRequest(@NotBlank @Email String correo, @NotBlank String password) {}
    public record DireccionResponse(Long id, String direccion, String referencia, String distrito, String ciudad, Boolean principal) {}
    public record UsuarioResponse(Long id, String nombre, String correo, String telefono, String documento, Rol rol, EstadoUsuario estado, List<DireccionResponse> direcciones) {}
}
