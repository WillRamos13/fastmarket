package com.fashmarket.api.controller;

import com.fashmarket.api.dto.ProductoRequest;
import com.fashmarket.api.dto.ProductoDtos;
import com.fashmarket.api.service.AuthTokenService;
import com.fashmarket.api.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService productoService;
    private final AuthTokenService authTokenService;

    public ProductoController(ProductoService productoService, AuthTokenService authTokenService) {
        this.productoService = productoService;
        this.authTokenService = authTokenService;
    }

    @GetMapping
    public List<ProductoDtos.ProductoResponse> listar(
            @RequestParam(required = false) Boolean oferta,
            @RequestParam(required = false) Boolean destacado,
            @RequestParam(required = false) Boolean incluirInactivos,
            @RequestParam(required = false) Long vendedorId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (vendedorId != null) {
            authTokenService.requerirAdmin(authorization);
            return productoService.listarPorVendedor(vendedorId);
        }
        if (Boolean.TRUE.equals(incluirInactivos)) {
            AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
            return productoService.listarParaPanel(actor, incluirInactivos);
        }
        return productoService.listar(oferta, destacado, incluirInactivos);
    }

    @GetMapping("/page")
    public Page<ProductoDtos.ProductoResponse> listarPaginado(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return productoService.listarPaginado(actor, page, size);
    }

    @GetMapping("/{id}")
    public ProductoDtos.ProductoResponse obtener(@PathVariable Long id) {
        return productoService.obtener(id);
    }

    @PostMapping
    public ProductoDtos.ProductoResponse crear(@RequestHeader(value = "Authorization", required = false) String authorization, @Valid @RequestBody ProductoRequest request) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return productoService.crear(actor, request);
    }

    @PutMapping("/{id}")
    public ProductoDtos.ProductoResponse actualizar(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        return productoService.actualizar(actor, id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id) {
        AuthTokenService.TokenData actor = authTokenService.requerirAdminOVendedor(authorization);
        productoService.eliminar(actor, id);
    }
}
