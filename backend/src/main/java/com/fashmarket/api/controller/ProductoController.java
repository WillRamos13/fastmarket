package com.fashmarket.api.controller;

import com.fashmarket.api.dto.ProductoRequest;
import com.fashmarket.api.model.Producto;
import com.fashmarket.api.service.AuthTokenService;
import com.fashmarket.api.service.ProductoService;
import jakarta.validation.Valid;
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
    public List<Producto> listar(
            @RequestParam(required = false) Boolean oferta,
            @RequestParam(required = false) Boolean destacado,
            @RequestParam(required = false) Boolean incluirInactivos,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (Boolean.TRUE.equals(incluirInactivos)) {
            authTokenService.requerirAdmin(authorization);
        }
        return productoService.listar(oferta, destacado, incluirInactivos);
    }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) {
        return productoService.obtener(id);
    }

    @PostMapping
    public Producto crear(@RequestHeader(value = "Authorization", required = false) String authorization, @Valid @RequestBody ProductoRequest request) {
        authTokenService.requerirAdmin(authorization);
        return productoService.crear(request);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        authTokenService.requerirAdmin(authorization);
        return productoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id) {
        authTokenService.requerirAdmin(authorization);
        productoService.eliminar(id);
    }
}
