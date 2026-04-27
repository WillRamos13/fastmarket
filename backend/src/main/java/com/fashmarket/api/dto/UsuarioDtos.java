package com.fashmarket.api.dto;

public class UsuarioDtos {
    public record ActualizarUsuarioRequest(String nombre, String telefono, String documento) {}
    public record AgregarDireccionRequest(String direccion, String referencia, String distrito, String ciudad, Boolean principal) {}
    public record CambiarPasswordRequest(String passwordActual, String passwordNueva) {}
}
