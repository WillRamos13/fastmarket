package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.Direccion;
import com.fashmarket.api.model.Pedido;
import com.fashmarket.api.model.PedidoItem;
import com.fashmarket.api.model.Usuario;

public class DtoMapper {
    public static AuthDtos.DireccionResponse toDireccionResponse(Direccion d) {
        return new AuthDtos.DireccionResponse(d.getId(), d.getDireccion());
    }

    public static AuthDtos.UsuarioResponse toUsuarioResponse(Usuario u) {
        return new AuthDtos.UsuarioResponse(
                u.getId(),
                u.getNombre(),
                u.getCorreo(),
                u.getTelefono(),
                u.getRol().name(),
                u.getEstado().name(),
                u.getDirecciones().stream().map(DtoMapper::toDireccionResponse).toList()
        );
    }

    public static PedidoDtos.ItemResponse toItemResponse(PedidoItem item) {
        return new PedidoDtos.ItemResponse(
                item.getId(),
                item.getProductoId(),
                item.getNombre(),
                item.getCantidad(),
                item.getPrecio()
        );
    }

    public static PedidoDtos.PedidoResponse toPedidoResponse(Pedido p) {
        return new PedidoDtos.PedidoResponse(
                p.getId(),
                p.getCodigo(),
                p.getFecha(),
                p.getEstado().name().toLowerCase(),
                p.getMetodo(),
                p.getDireccion(),
                p.getReferencia(),
                p.getHorario(),
                p.getEntregaEstimada(),
                p.getTotal(),
                p.getUsuario().getNombre(),
                p.getProductos().stream().map(DtoMapper::toItemResponse).toList()
        );
    }
}
