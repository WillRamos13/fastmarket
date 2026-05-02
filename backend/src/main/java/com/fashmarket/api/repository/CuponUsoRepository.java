package com.fashmarket.api.repository;

import com.fashmarket.api.model.CuponUso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CuponUsoRepository extends JpaRepository<CuponUso, Long> {
    long countByCuponIdAndUsuarioId(Long cuponId, Long usuarioId);
    List<CuponUso> findByCuponIdOrderByFechaDesc(Long cuponId);
    List<CuponUso> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
