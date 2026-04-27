package com.fashmarket.api.service;

import com.fashmarket.api.dto.BannerRequest;
import com.fashmarket.api.model.Banner;
import com.fashmarket.api.repository.BannerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {
    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public List<Banner> listar(Boolean soloActivos) {
        if (Boolean.TRUE.equals(soloActivos)) {
            return bannerRepository.findByActivoTrue();
        }
        return bannerRepository.findAll();
    }

    public Banner obtener(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Banner no encontrado"));
    }

    public Banner crear(BannerRequest request) {
        Banner banner = new Banner();
        aplicarDatos(banner, request);
        return bannerRepository.save(banner);
    }

    public Banner actualizar(Long id, BannerRequest request) {
        Banner banner = obtener(id);
        aplicarDatos(banner, request);
        return bannerRepository.save(banner);
    }

    public void eliminar(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new EntityNotFoundException("Banner no encontrado");
        }
        bannerRepository.deleteById(id);
    }

    private void aplicarDatos(Banner banner, BannerRequest request) {
        banner.setTitulo(request.titulo().trim());
        banner.setDescripcion(request.descripcion().trim());
        banner.setImagen(request.imagen());
        banner.setActivo(request.activo() == null || request.activo());
    }
}
