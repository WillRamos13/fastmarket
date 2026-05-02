package com.fashmarket.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductoDtos {
    public record ProductoResponse(
            Long id,
            String nombre,
            String categoria,
            BigDecimal precio,
            BigDecimal precioAntes,
            Integer stock,
            String imagen,
            String descripcion,
            Boolean oferta,
            Boolean destacado,
            Boolean activo,
            Long vendedorId,
            String vendedorNombre,
            LocalDateTime creadoEn
    ) {}
}
