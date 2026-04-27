package com.fashmarket.api.repository;

import com.fashmarket.api.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
    List<Pedido> findAllByOrderByFechaDesc();
}
