package com.fashmarket.api.repository;

import com.fashmarket.api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrueOrderByIdDesc();
    List<Producto> findByActivoTrueAndOfertaTrueOrderByIdDesc();
    List<Producto> findByActivoTrueAndDestacadoTrueOrderByIdDesc();
    List<Producto> findByActivoTrueAndOfertaTrueAndDestacadoTrueOrderByIdDesc();
    List<Producto> findByVendedorIdOrderByIdDesc(Long vendedorId);
    List<Producto> findByVendedorIdAndActivoTrueOrderByIdDesc(Long vendedorId);
    Page<Producto> findByVendedorId(Long vendedorId, Pageable pageable);
    Page<Producto> findByActivoTrue(Pageable pageable);

    long countByActivoTrue();
    long countByActivoTrueAndOfertaTrue();
    long countByVendedorIdAndActivoTrue(Long vendedorId);
    long countByVendedorIdAndActivoTrueAndOfertaTrue(Long vendedorId);

    @Query("select coalesce(sum(p.stock), 0) from Producto p where p.activo = true")
    Long sumarStockTotalActivo();

    @Query("select coalesce(sum(p.stock), 0) from Producto p where p.activo = true and p.vendedor.id = ?1")
    Long sumarStockTotalActivoPorVendedor(Long vendedorId);
}
