package com.fashmarket.api.controller;

import com.fashmarket.api.dto.CuponDtos;
import com.fashmarket.api.service.AuthTokenService;
import com.fashmarket.api.service.CuponService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cupones")
public class CuponController {
    private final CuponService cuponService;
    private final AuthTokenService authTokenService;

    public CuponController(CuponService cuponService, AuthTokenService authTokenService) {
        this.cuponService = cuponService;
        this.authTokenService = authTokenService;
    }

    @GetMapping
    public List<CuponDtos.CuponResponse> listar(@RequestHeader(value = "Authorization", required = false) String authorization) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return cuponService.listar(actor);
    }

    @PostMapping
    public CuponDtos.CuponResponse crear(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody CuponDtos.CuponRequest request) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return cuponService.crear(actor, request);
    }

    @PutMapping("/{id}")
    public CuponDtos.CuponResponse actualizar(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id, @RequestBody CuponDtos.CuponRequest request) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return cuponService.actualizar(actor, id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        cuponService.eliminar(actor, id);
    }

    @GetMapping("/{id}/usos")
    public List<CuponDtos.CuponUsoResponse> usos(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return cuponService.listarUsos(actor, id);
    }

    @PostMapping("/aplicar")
    public CuponDtos.AplicarCuponResponse aplicar(@RequestBody CuponDtos.AplicarCuponRequest request) {
        return cuponService.aplicar(request);
    }
}
