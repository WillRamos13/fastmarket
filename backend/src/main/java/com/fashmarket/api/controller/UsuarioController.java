package com.fashmarket.api.controller;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.dto.UsuarioDtos;
import com.fashmarket.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<AuthDtos.UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/{id}")
    public AuthDtos.UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PutMapping("/{id}")
    public AuthDtos.UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioDtos.ActualizarUsuarioRequest request) {
        return usuarioService.actualizar(id, request);
    }

    @PostMapping("/{id}/direcciones")
    public AuthDtos.UsuarioResponse agregarDireccion(@PathVariable Long id, @Valid @RequestBody UsuarioDtos.AgregarDireccionRequest request) {
        return usuarioService.agregarDireccion(id, request);
    }

    @DeleteMapping("/{usuarioId}/direcciones/{direccionId}")
    public void eliminarDireccion(@PathVariable Long usuarioId, @PathVariable Long direccionId) {
        usuarioService.eliminarDireccion(usuarioId, direccionId);
    }

    @PutMapping("/{id}/password")
    public void cambiarPassword(@PathVariable Long id, @Valid @RequestBody UsuarioDtos.CambiarPasswordRequest request) {
        usuarioService.cambiarPassword(id, request);
    }
}
