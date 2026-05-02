package com.fashmarket.api.repository;

import com.fashmarket.api.model.PedidoHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoHistorialRepository extends JpaRepository<PedidoHistorial, Long> {
    List<PedidoHistorial> findByPedidoIdOrderByFechaAsc(Long pedidoId);
}
