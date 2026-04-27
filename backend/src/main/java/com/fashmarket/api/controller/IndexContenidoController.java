package com.fashmarket.api.controller;

import com.fashmarket.api.dto.IndexContenidoRequest;
import com.fashmarket.api.model.IndexContenido;
import com.fashmarket.api.service.IndexContenidoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/index-contenido")
public class IndexContenidoController {
    private final IndexContenidoService service;
    public IndexContenidoController(IndexContenidoService service) { this.service = service; }
    @GetMapping public List<IndexContenido> listar(@RequestParam(required = false) String tipo, @RequestParam(required = false) Boolean activo) { return service.listar(tipo, activo); }
    @GetMapping("/{id}") public IndexContenido obtener(@PathVariable Long id) { return service.obtener(id); }
    @GetMapping("/tipo/{tipo}") public List<IndexContenido> listarPorTipo(@PathVariable String tipo, @RequestParam(required = false) Boolean activo) { return service.listar(tipo, activo); }
    @PostMapping public IndexContenido crear(@Valid @RequestBody IndexContenidoRequest request) { return service.crear(request); }
    @PutMapping("/{id}") public IndexContenido actualizar(@PathVariable Long id, @Valid @RequestBody IndexContenidoRequest request) { return service.actualizar(id, request); }
    @DeleteMapping("/{id}") public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
