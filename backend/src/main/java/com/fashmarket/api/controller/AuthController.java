package com.fashmarket.api.controller;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public AuthDtos.UsuarioResponse registrar(@Valid @RequestBody AuthDtos.RegistroRequest request) {
        return authService.registrar(request);
    }

    @PostMapping("/login")
    public AuthDtos.UsuarioResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }
}
