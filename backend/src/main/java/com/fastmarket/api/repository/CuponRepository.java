package com.fastmarket.api.repository;

import com.fastmarket.api.model.Cupon;
import com.fastmarket.api.model.TipoCupon;
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
