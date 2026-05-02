package com.fashmarket.api.repository;

import com.fashmarket.api.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
    List<Pedido> findAllByOrderByFechaDesc();

    @Query("select distinct p from Pedido p join p.items i where i.vendedor.id = ?1 order by p.fecha desc")
    List<Pedido> findByVendedorIdOrderByFechaDesc(Long vendedorId);

    @Query(value = "select distinct p from Pedido p join p.items i where i.vendedor.id = ?1", countQuery = "select count(distinct p.id) from Pedido p join p.items i where i.vendedor.id = ?1")
    Page<Pedido> findByVendedorId(Long vendedorId, Pageable pageable);

    @Query("select count(distinct p.id) from Pedido p join p.items i where i.vendedor.id = ?1")
    long countByVendedorId(Long vendedorId);
}
