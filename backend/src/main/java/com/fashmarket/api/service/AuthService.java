package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.model.EstadoUsuario;
import com.fashmarket.api.model.Rol;
import com.fashmarket.api.model.Usuario;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    public AuthService(UsuarioRepository usuarioRepository) { this.usuarioRepository = usuarioRepository; }

    @Transactional
    public AuthDtos.UsuarioResponse registrar(AuthDtos.RegistroRequest request) {
        if (usuarioRepository.existsByCorreoIgnoreCase(request.correo())) throw new IllegalArgumentException("El correo ya está registrado");
        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre()); usuario.setCorreo(request.correo().toLowerCase()); usuario.setPassword(request.password());
        usuario.setTelefono(request.telefono()); usuario.setDocumento(request.documento()); usuario.setRol(Rol.CLIENTE); usuario.setEstado(EstadoUsuario.ACTIVO);
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    public AuthDtos.UsuarioResponse login(AuthDtos.LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(request.correo()).orElseThrow(() -> new IllegalArgumentException("Correo o contraseña incorrectos"));
        if (!usuario.getPassword().equals(request.password())) throw new IllegalArgumentException("Correo o contraseña incorrectos");
        if (usuario.getEstado() != EstadoUsuario.ACTIVO) throw new IllegalArgumentException("Usuario inactivo");
        return DtoMapper.toUsuarioResponse(usuario);
    }
}
