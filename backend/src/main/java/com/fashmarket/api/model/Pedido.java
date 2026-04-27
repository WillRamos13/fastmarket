package com.fashmarket.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 40)
    private String codigo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;
    @Column(columnDefinition = "TEXT")
    private String direccionEntrega;
    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PedidoItem> items = new ArrayList<>();

    public Pedido() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getCodigo(){return codigo;} public void setCodigo(String codigo){this.codigo=codigo;}
    public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario usuario){this.usuario=usuario;}
    public BigDecimal getTotal(){return total;} public void setTotal(BigDecimal total){this.total=total;}
    public EstadoPedido getEstado(){return estado;} public void setEstado(EstadoPedido estado){this.estado=estado;}
    public String getDireccionEntrega(){return direccionEntrega;} public void setDireccionEntrega(String direccionEntrega){this.direccionEntrega=direccionEntrega;}
    public LocalDateTime getFecha(){return fecha;} public void setFecha(LocalDateTime fecha){this.fecha=fecha;}
    public List<PedidoItem> getItems(){return items;} public void setItems(List<PedidoItem> items){this.items=items;}
}
