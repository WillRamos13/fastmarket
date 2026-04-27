package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.dto.UsuarioDtos;
import com.fashmarket.api.model.Direccion;
import com.fashmarket.api.model.Usuario;
import com.fashmarket.api.repository.DireccionRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, DireccionRepository direccionRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.direccionRepository = direccionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AuthDtos.UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(DtoMapper::toUsuarioResponse).toList();
    }

    public AuthDtos.UsuarioResponse obtener(Long id) {
        return DtoMapper.toUsuarioResponse(buscarUsuario(id));
    }

    @Transactional
    public AuthDtos.UsuarioResponse actualizar(Long id, UsuarioDtos.ActualizarUsuarioRequest request) {
        Usuario usuario = buscarUsuario(id);
        String nuevoCorreo = request.correo().trim().toLowerCase();

        usuarioRepository.findByCorreoIgnoreCase(nuevoCorreo).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new IllegalArgumentException("Ese correo ya pertenece a otro usuario");
            }
        });

        usuario.setNombre(request.nombre().trim());
        usuario.setCorreo(nuevoCorreo);
        usuario.setTelefono(request.telefono().trim());
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AuthDtos.UsuarioResponse agregarDireccion(Long id, UsuarioDtos.AgregarDireccionRequest request) {
        Usuario usuario = buscarUsuario(id);
        usuario.agregarDireccion(new Direccion(request.direccion().trim()));
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminarDireccion(Long usuarioId, Long direccionId) {
        Direccion direccion = direccionRepository.findById(direccionId)
                .orElseThrow(() -> new EntityNotFoundException("Dirección no encontrada"));

        if (!direccion.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("La dirección no pertenece a este usuario");
        }

        direccionRepository.delete(direccion);
    }

    @Transactional
    public void cambiarPassword(Long id, UsuarioDtos.CambiarPasswordRequest request) {
        Usuario usuario = buscarUsuario(id);

        if (!passwordEncoder.matches(request.actual(), usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(request.nueva()));
        usuarioRepository.save(usuario);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }
}
