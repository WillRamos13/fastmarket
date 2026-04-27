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

    public UsuarioService(UsuarioRepository usuarioRepository, DireccionRepository direccionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.direccionRepository = direccionRepository;
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
        if (request.nombre() != null && !request.nombre().isBlank()) usuario.setNombre(request.nombre());
        usuario.setTelefono(request.telefono());
        usuario.setDocumento(request.documento());
        return DtoMapper.toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public AuthDtos.UsuarioResponse agregarDireccion(Long id, UsuarioDtos.AgregarDireccionRequest request) {
        Usuario usuario = obtenerEntidad(id);
        if (Boolean.TRUE.equals(request.principal())) {
            usuario.getDirecciones().forEach(direccion -> direccion.setPrincipal(false));
        }
        Direccion direccion = new Direccion(usuario, request.direccion(), request.referencia(), request.distrito(), request.ciudad(), Boolean.TRUE.equals(request.principal()));
        usuario.getDirecciones().add(direccion);
        direccionRepository.save(direccion);
        return DtoMapper.toUsuarioResponse(usuario);
    }

    private Usuario obtenerEntidad(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }
}
