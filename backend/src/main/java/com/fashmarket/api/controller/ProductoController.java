package com.fashmarket.api.controller;

import com.fashmarket.api.dto.ProductoRequest;
import com.fashmarket.api.model.Producto;
import com.fashmarket.api.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoService productoService;
    public ProductoController(ProductoService productoService) { this.productoService = productoService; }

    @GetMapping
    public List<Producto> listar(@RequestParam(required = false) Boolean oferta, @RequestParam(required = false) Boolean destacado) { return productoService.listar(oferta, destacado); }
    @GetMapping("/{id}") public Producto obtener(@PathVariable Long id) { return productoService.obtener(id); }
    @PostMapping public Producto crear(@Valid @RequestBody ProductoRequest request) { return productoService.crear(request); }
    @PutMapping("/{id}") public Producto actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) { return productoService.actualizar(id, request); }
    @DeleteMapping("/{id}") public void eliminar(@PathVariable Long id) { productoService.eliminar(id); }
}
