package com.fashmarket.api.service;

import com.fashmarket.api.dto.AuthDtos;
import com.fashmarket.api.dto.PedidoDtos;
import com.fashmarket.api.model.Direccion;
import com.fashmarket.api.model.Pedido;
import com.fashmarket.api.model.PedidoItem;
import com.fashmarket.api.model.Usuario;

import java.util.List;

public class DtoMapper {
    private DtoMapper() {}

    public static AuthDtos.DireccionResponse toDireccionResponse(Direccion direccion) {
        return new AuthDtos.DireccionResponse(
                direccion.getId(), direccion.getDireccion(), direccion.getReferencia(),
                direccion.getDistrito(), direccion.getCiudad(), direccion.getPrincipal()
        );
    }

    public static AuthDtos.UsuarioResponse toUsuarioResponse(Usuario usuario) {
        List<AuthDtos.DireccionResponse> direcciones = usuario.getDirecciones()
                .stream()
                .map(DtoMapper::toDireccionResponse)
                .toList();

        return new AuthDtos.UsuarioResponse(
                usuario.getId(), usuario.getNombre(), usuario.getCorreo(), usuario.getTelefono(),
                usuario.getDocumento(), usuario.getRol(), usuario.getEstado(), direcciones
        );
    }

    public static PedidoDtos.ItemResponse toItemResponse(PedidoItem item) {
        return new PedidoDtos.ItemResponse(
                item.getProducto().getId(), item.getProductoNombre(), item.getCantidad(),
                item.getPrecioUnitario(), item.getSubtotal()
        );
    }

    public static PedidoDtos.PedidoResponse toPedidoResponse(Pedido pedido) {
        List<PedidoDtos.ItemResponse> items = pedido.getItems().stream()
                .map(DtoMapper::toItemResponse)
                .toList();

        return new PedidoDtos.PedidoResponse(
                pedido.getId(), pedido.getCodigo(), pedido.getUsuario().getId(), pedido.getUsuario().getNombre(),
                pedido.getTotal(), pedido.getEstado(), pedido.getDireccionEntrega(), pedido.getFecha(), items
        );
    }
}
