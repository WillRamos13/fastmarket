package com.fashmarket.api.controller;

import com.fashmarket.api.dto.BannerRequest;
import com.fashmarket.api.model.Banner;
import com.fashmarket.api.service.BannerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {
    private final BannerService bannerService;
    public BannerController(BannerService bannerService) { this.bannerService = bannerService; }
    @GetMapping public List<Banner> listar(@RequestParam(required = false) Boolean activo) { return bannerService.listar(activo); }
    @GetMapping("/{id}") public Banner obtener(@PathVariable Long id) { return bannerService.obtener(id); }
    @PostMapping public Banner crear(@Valid @RequestBody BannerRequest request) { return bannerService.crear(request); }
    @PutMapping("/{id}") public Banner actualizar(@PathVariable Long id, @Valid @RequestBody BannerRequest request) { return bannerService.actualizar(id, request); }
    @DeleteMapping("/{id}") public void eliminar(@PathVariable Long id) { bannerService.eliminar(id); }
}
