package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.dto.UsuarioDtos;
import com.fashmarket.api.model.Direccion;
import com.fashmarket.api.model.Usuario;
import com.fashmarket.api.repository.DireccionRepository;
import com.fashmarket.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;
    private final PasswordService passwordService;

    public UsuarioService(UsuarioRepository usuarioRepository, DireccionRepository direccionRepository, PasswordService passwordService) {
        this.usuarioRepository = usuarioRepository;
        this.direccionRepository = direccionRepository;
        this.passwordService = passwordService;
    }

    public List<AuthDtos.UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(DtoMapper::toUsuarioResponse).toList();
    }

    public AuthDtos.UsuarioResponse obtener(Long id) {
        return DtoMapper.toUsuarioResponse(obtenerEntidad(id));
    }

    @Transactional
    public AuthDtos.UsuarioResponse actualizar(Long id, UsuarioDtos.ActualizarUsuarioRequest request) {
        Usuario usuario = obtenerEntidad(id);
        if (request.nombre() != null && !request.nombre().isBlank()) usuario.setNombre(request.nombre().trim());
        usuario.setTelefono(limpiar(request.telefono()));
        usuario.setDocumento(limpiar(request.documento()));
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AuthDtos.UsuarioResponse agregarDireccion(Long id, UsuarioDtos.AgregarDireccionRequest request) {
        Usuario usuario = obtenerEntidad(id);

        if (request.direccion() == null || request.direccion().isBlank()) {
            throw new IllegalArgumentException("La dirección es obligatoria");
        }

        if (Boolean.TRUE.equals(request.principal()) || usuario.getDirecciones().isEmpty()) {
            usuario.getDirecciones().forEach(direccion -> direccion.setPrincipal(false));
        }

        Direccion direccion = new Direccion(
                usuario,
                request.direccion().trim(),
                limpiar(request.referencia()),
                limpiar(request.distrito()),
                limpiar(request.ciudad()),
                usuario.getDirecciones().isEmpty() || Boolean.TRUE.equals(request.principal())
        );

        usuario.getDirecciones().add(direccion);
        direccionRepository.save(direccion);
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AuthDtos.UsuarioResponse cambiarPassword(Long id, UsuarioDtos.CambiarPasswordRequest request) {
        Usuario usuario = obtenerEntidad(id);

        if (request.passwordActual() == null || request.passwordActual().isBlank()) {
            throw new IllegalArgumentException("Ingresa tu contraseña actual");
        }

        if (!passwordService.coincide(request.passwordActual(), usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        if (request.passwordNueva() == null || request.passwordNueva().length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener mínimo 6 caracteres");
        }

        usuario.setPassword(passwordService.encriptar(request.passwordNueva()));
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    private Usuario obtenerEntidad(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
