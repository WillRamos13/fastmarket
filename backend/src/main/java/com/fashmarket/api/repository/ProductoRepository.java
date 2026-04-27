package com.fashmarket.api.repository;

import com.fashmarket.api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrueOrderByIdDesc();
    List<Producto> findByActivoTrueAndOfertaTrueOrderByIdDesc();
    List<Producto> findByActivoTrueAndDestacadoTrueOrderByIdDesc();
    List<Producto> findByActivoTrueAndOfertaTrueAndDestacadoTrueOrderByIdDesc();

    long countByActivoTrue();
    long countByActivoTrueAndOfertaTrue();

    @Query("select coalesce(sum(p.stock), 0) from Producto p where p.activo = true")
    Long sumarStockTotalActivo();
}
