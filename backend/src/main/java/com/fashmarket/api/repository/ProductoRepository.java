package com.fashmarket.api.repository;

import com.fashmarket.api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByOfertaTrue();
    List<Producto> findByDestacadoTrue();
    List<Producto> findByOfertaTrueAndDestacadoTrue();
    long countByOfertaTrue();

    @Query("select coalesce(sum(p.stock), 0) from Producto p")
    Long sumarStockTotal();
}
