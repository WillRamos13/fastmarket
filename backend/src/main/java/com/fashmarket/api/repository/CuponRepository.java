package com.fashmarket.api.repository;

import com.fashmarket.api.model.Cupon;
import com.fashmarket.api.model.TipoCupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {
    Optional<Cupon> findByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
    List<Cupon> findAllByOrderByIdDesc();
    List<Cupon> findByTipoOrderByIdDesc(TipoCupon tipo);
    List<Cupon> findByVendedorIdOrderByIdDesc(Long vendedorId);
}
