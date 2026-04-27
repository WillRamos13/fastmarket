package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.model.Direccion;
import com.fashmarket.api.model.EstadoUsuario;
import com.fashmarket.api.model.Rol;
import com.fashmarket.api.model.Usuario;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordService passwordService;
    private final AuthTokenService authTokenService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordService passwordService, AuthTokenService authTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordService = passwordService;
        this.authTokenService = authTokenService;
    }

    @Transactional
    public AuthDtos.AuthResponse registrar(AuthDtos.RegistroRequest request) {
        String correo = request.correo().trim().toLowerCase();
        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setPassword(passwordService.encriptar(request.password()));
        usuario.setTelefono(limpiar(request.telefono()));
        usuario.setDocumento(limpiar(request.documento()));
        usuario.setRol(Rol.CLIENTE);
        usuario.setEstado(EstadoUsuario.ACTIVO);

        if (request.direccion() != null && !request.direccion().isBlank()) {
            Direccion direccion = new Direccion(usuario, request.direccion().trim(), "", "Ica", "Ica", true);
            usuario.getDirecciones().add(direccion);
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return new AuthDtos.AuthResponse(DtoMapper.toUsuarioResponse(guardado), authTokenService.generarToken(guardado));
    }

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(request.correo().trim())
                .orElseThrow(() -> new IllegalArgumentException("Correo o contraseña incorrectos"));

        if (!passwordService.coincide(request.password(), usuario.getPassword())) {
            throw new IllegalArgumentException("Correo o contraseña incorrectos");
        }

        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalArgumentException("Usuario inactivo");
        }

        if (!passwordService.esHashBcrypt(usuario.getPassword())) {
            usuario.setPassword(passwordService.encriptar(request.password()));
            usuarioRepository.save(usuario);
        }

        return new AuthDtos.AuthResponse(DtoMapper.toUsuarioResponse(usuario), authTokenService.generarToken(usuario));
    }


    @Transactional
    public void recuperarPassword(AuthDtos.RecuperarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(request.correo().trim())
                .orElseThrow(() -> new IllegalArgumentException("No existe una cuenta registrada con ese correo"));
        usuario.setPassword(passwordService.encriptar(request.passwordNueva()));
        usuarioRepository.save(usuario);
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
