package com.fashmarket.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String categoria;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_antes", precision = 12, scale = 2)
    private BigDecimal precioAntes;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(columnDefinition = "TEXT")
    private String imagen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private Boolean oferta = false;

    @Column(nullable = false)
    private Boolean destacado = false;

    public Producto() {}

    public Producto(String nombre, String categoria, BigDecimal precio, BigDecimal precioAntes, Integer stock, String imagen, String descripcion, Boolean oferta, Boolean destacado) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.precioAntes = precioAntes;
        this.stock = stock;
        this.imagen = imagen;
        this.descripcion = descripcion;
        this.oferta = oferta;
        this.destacado = destacado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public BigDecimal getPrecioAntes() { return precioAntes; }
    public void setPrecioAntes(BigDecimal precioAntes) { this.precioAntes = precioAntes; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Boolean getOferta() { return oferta; }
    public void setOferta(Boolean oferta) { this.oferta = oferta; }
    public Boolean getDestacado() { return destacado; }
    public void setDestacado(Boolean destacado) { this.destacado = destacado; }
}
