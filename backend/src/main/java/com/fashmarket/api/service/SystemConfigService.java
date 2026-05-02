package com.fashmarket.api.service;

import com.fashmarket.api.model.SystemConfig;
import com.fashmarket.api.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SystemConfigService {
    public static final String POWERBI_URL = "powerbi_url";

    private final SystemConfigRepository repository;

    public SystemConfigService(SystemConfigRepository repository) {
        this.repository = repository;
    }

    public Optional<String> obtener(String clave) {
        return repository.findById(clave).map(SystemConfig::getValor).filter(v -> v != null && !v.isBlank());
    }

    @Transactional
    public String guardar(String clave, String valor, Long usuarioId) {
        SystemConfig config = repository.findById(clave).orElse(new SystemConfig());
        config.setClave(clave);
        config.setValor(valor == null ? "" : valor.trim());
        config.setActualizadoPor(usuarioId);
        config.setActualizadoEn(java.time.LocalDateTime.now());
        repository.save(config);
        return config.getValor();
    }

    @Transactional
    public void eliminar(String clave, Long usuarioId) {
        SystemConfig config = repository.findById(clave).orElse(new SystemConfig(clave, "", usuarioId));
        config.setValor("");
        config.setActualizadoPor(usuarioId);
        config.setActualizadoEn(java.time.LocalDateTime.now());
        repository.save(config);
    }
}
