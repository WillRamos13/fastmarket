package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.model.Direccion;
import com.fashmarket.api.model.Usuario;
import com.fashmarket.api.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthDtos.UsuarioResponse registrar(AuthDtos.RegistroRequest request) {
        String correo = request.correo().trim().toLowerCase();

        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new IllegalArgumentException("Este correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setTelefono(request.telefono().trim());
        usuario.setPassword(passwordEncoder.encode(request.password()));

        if (request.direccion() != null && !request.direccion().trim().isBlank()) {
            usuario.agregarDireccion(new Direccion(request.direccion().trim()));
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return DtoMapper.toUsuarioResponse(guardado);
    }

    public AuthDtos.UsuarioResponse login(AuthDtos.LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(request.correo().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Correo o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new IllegalArgumentException("Correo o contraseña incorrectos");
        }

        return DtoMapper.toUsuarioResponse(usuario);
    }
}
