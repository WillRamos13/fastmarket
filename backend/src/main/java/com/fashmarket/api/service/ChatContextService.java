package com.fashmarket.api.service;

import com.fashmarket.api.model.Pedido;
import com.fashmarket.api.model.PedidoItem;
import com.fashmarket.api.model.Producto;
import com.fashmarket.api.repository.PedidoRepository;
import com.fashmarket.api.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatContextService {
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;

    public ChatContextService(ProductoRepository productoRepository, PedidoRepository pedidoRepository) {
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public ChatContext construirContexto(String mensaje, Long usuarioId) {
        String texto = normalizar(mensaje);
        StringBuilder contexto = new StringBuilder();
        boolean usaDatos = false;

        contexto.append("Información general de FashMarket:\n");
        contexto.append("- FashMarket es una tienda online con catálogo, promociones, carrito, checkout, pedidos y perfil del cliente.\n");
        contexto.append("- Para comprar, el cliente debe iniciar sesión, agregar productos al carrito y confirmar el pedido en checkout.\n");
        contexto.append("- Los pedidos se revisan desde la sección Mis pedidos.\n");
        contexto.append("- Los envíos se coordinan según dirección, zona, horario y disponibilidad.\n");
        contexto.append("- No inventes datos que no estén en el contexto. Si falta un dato, pide revisar la página o contactar a la tienda.\n\n");

        boolean hablaProductos = contiene(texto, "producto", "productos", "catalogo", "catálogo", "precio", "cuesta", "stock", "disponible", "disponibles", "hay", "comprar", "articulo", "artículo");
        boolean hablaOfertas = contiene(texto, "oferta", "ofertas", "promocion", "promoción", "promociones", "descuento", "rebaja", "barato", "barata");
        boolean hablaPedidos = contiene(texto, "pedido", "pedidos", "orden", "ordenes", "órdenes", "compra", "compras", "estado", "seguimiento", "entrega");

        if (hablaOfertas) {
            List<Producto> ofertas = productoRepository.findByActivoTrueAndOfertaTrueOrderByIdDesc().stream().limit(12).toList();
            contexto.append("Ofertas reales disponibles en base de datos:\n");
            if (ofertas.isEmpty()) {
                contexto.append("- Actualmente no hay productos marcados como oferta.\n");
            } else {
                ofertas.forEach(p -> contexto.append(formatearProducto(p)).append("\n"));
            }
            contexto.append("\n");
            usaDatos = true;
        }

        if (hablaProductos || (!hablaOfertas && !hablaPedidos)) {
            List<Producto> productos = productoRepository.findByActivoTrueOrderByIdDesc().stream().limit(15).toList();
            contexto.append("Productos reales activos en base de datos, máximo 15 recientes:\n");
            if (productos.isEmpty()) {
                contexto.append("- No hay productos activos registrados en este momento.\n");
            } else {
                productos.forEach(p -> contexto.append(formatearProducto(p)).append("\n"));
            }
            contexto.append("\n");
            usaDatos = true;
        }

        if (hablaPedidos) {
            contexto.append("Pedidos del cliente:\n");
            if (usuarioId == null) {
                contexto.append("- El usuario no ha iniciado sesión o no se pudo validar su token. Indícale que inicie sesión para revisar pedidos reales.\n");
            } else {
                List<Pedido> pedidos = pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream().limit(5).toList();
                if (pedidos.isEmpty()) {
                    contexto.append("- El usuario no tiene pedidos registrados.\n");
                } else {
                    pedidos.forEach(p -> contexto.append(formatearPedido(p)).append("\n"));
                }
            }
            contexto.append("\n");
            usaDatos = true;
        }

        return new ChatContext(contexto.toString(), usaDatos);
    }

    public String respuestaLocal(String mensaje, ChatContext contexto) {
        String texto = normalizar(mensaje);

        if (contiene(texto, "hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches")) {
            return "¡Hola! 😊 Soy el asistente de FashMarket. Puedes preguntarme por productos, ofertas, stock, pedidos, envíos o pagos.";
        }

        if (contiene(texto, "pedido", "pedidos", "orden", "estado", "seguimiento")) {
            if (contexto.texto().contains("El usuario no ha iniciado sesión")) {
                return "Para revisar tus pedidos reales debes iniciar sesión y entrar a la sección Mis pedidos. Así podré ayudarte con el estado de tu compra.";
            }
            if (contexto.texto().contains("no tiene pedidos registrados")) {
                return "No encontré pedidos registrados en tu cuenta. Cuando confirmes una compra, aparecerá en la sección Mis pedidos.";
            }

            String pedidos = listarPedidosDesdeContexto(contexto);
            if (!pedidos.isBlank()) {
                return "Estos son tus pedidos más recientes:\n" + pedidos + "\n\nPara ver el detalle completo, entra a Mis pedidos.";
            }

            return "Encontré información de tus pedidos en la base de datos. Revisa Mis pedidos para ver el detalle completo, estado, productos y total.";
        }

        if (contiene(texto, "oferta", "ofertas", "promocion", "promoción", "promociones", "descuento", "rebaja")) {
            if (contexto.texto().contains("Actualmente no hay productos marcados como oferta")) {
                return "Por ahora no hay ofertas activas registradas. Puedes revisar el catálogo porque las promociones pueden cambiar según temporada y stock.";
            }

            String ofertas = listarProductosDesdeContexto(contexto, true);
            if (!ofertas.isBlank()) {
                return "Estos productos están en oferta ahora mismo en FashMarket:\n"
                        + ofertas
                        + "\n\nPuedes verlos con imagen y detalle en la sección Promociones o en el catálogo.";
            }

            return "Sí, hay ofertas registradas en FashMarket. Puedes verlas en la sección Promociones o en el catálogo cuando el producto muestra precio anterior.";
        }

        if (contiene(texto, "stock", "disponible", "disponibles", "hay", "producto", "productos", "catalogo", "catálogo", "comprar", "precio", "cuesta")) {
            if (contexto.texto().contains("No hay productos activos registrados")) {
                return "Por ahora no hay productos activos registrados en FashMarket.";
            }

            String productos = listarProductosDesdeContexto(contexto, false);
            if (!productos.isBlank()) {
                return "Estos son algunos productos disponibles en FashMarket:\n"
                        + productos
                        + "\n\nPara ver imágenes, detalles y agregar al carrito, entra al catálogo de productos.";
            }

            return "Puedes revisar el catálogo completo en Productos. Ahí verás precio, stock y detalle de cada artículo.";
        }

        if (contiene(texto, "envio", "envío", "delivery", "entrega", "direccion", "dirección")) {
            return "Los envíos se coordinan según tu dirección, zona y horario. Al confirmar tu pedido debes ingresar dirección, referencia y teléfono de entrega.";
        }

        if (contiene(texto, "pago", "yape", "plin", "efectivo", "tarjeta")) {
            return "El método de pago se coordina al confirmar tu pedido. Puedes consultar con la tienda si está disponible Yape, Plin, efectivo u otro método.";
        }

        return "Puedo ayudarte con productos, ofertas, stock, pedidos, envíos, pagos y uso de la página. ¿Sobre qué parte de FashMarket quieres consultar?";
    }

    private String listarProductosDesdeContexto(ChatContext contexto, boolean soloOfertas) {
        return contexto.texto().lines()
                .filter(linea -> linea.startsWith("- ID "))
                .filter(linea -> !soloOfertas || linea.contains("oferta: sí"))
                .limit(8)
                .map(this::formatearProductoParaCliente)
                .filter(linea -> !linea.isBlank())
                .collect(Collectors.joining("\n"));
    }

    private String formatearProductoParaCliente(String linea) {
        String limpia = linea.replaceFirst("^- ID \\d+:\\s*", "");
        String[] partes = limpia.split("\\s*\\|\\s*");

        String nombre = partes.length > 0 ? partes[0].trim() : "Producto";
        String categoria = valorCampo(partes, "categoría:");
        String precio = valorCampo(partes, "precio:");
        String antes = valorCampo(partes, "antes:");
        String stock = valorCampo(partes, "stock:");

        StringBuilder respuesta = new StringBuilder("• ").append(nombre);

        if (!categoria.isBlank() && !categoria.equalsIgnoreCase("No registrado")) {
            respuesta.append(" (").append(categoria).append(")");
        }

        if (!precio.isBlank()) {
            respuesta.append(" — ").append(precio);
        }

        if (!antes.isBlank()) {
            respuesta.append(" antes ").append(antes);
        }

        if (!stock.isBlank()) {
            respuesta.append(" — stock: ").append(stock);
        }

        return respuesta.toString();
    }

    private String listarPedidosDesdeContexto(ChatContext contexto) {
        return contexto.texto().lines()
                .filter(linea -> linea.startsWith("- Pedido "))
                .limit(5)
                .map(linea -> "• " + linea.replaceFirst("^- ", ""))
                .collect(Collectors.joining("\n"));
    }

    private String valorCampo(String[] partes, String campo) {
        for (String parte : partes) {
            String p = parte.trim();
            if (normalizar(p).startsWith(normalizar(campo))) {
                return p.substring(campo.length()).trim();
            }
        }
        return "";
    }

    private String formatearProducto(Producto p) {
        return "- ID " + p.getId()
                + ": " + seguro(p.getNombre())
                + " | categoría: " + seguro(p.getCategoria())
                + " | precio: " + dinero(p.getPrecio())
                + (p.getPrecioAntes() != null ? " | antes: " + dinero(p.getPrecioAntes()) : "")
                + " | stock: " + (p.getStock() == null ? 0 : p.getStock())
                + " | oferta: " + siNo(p.getOferta())
                + " | destacado: " + siNo(p.getDestacado())
                + " | descripción: " + recortar(seguro(p.getDescripcion()), 130);
    }

    private String formatearPedido(Pedido p) {
        String items = Optional.ofNullable(p.getItems()).orElse(List.of()).stream()
                .map(this::formatearItem)
                .collect(Collectors.joining(", "));

        return "- Pedido " + seguro(p.getCodigo())
                + " | estado: " + p.getEstado()
                + " | total: " + dinero(p.getTotal())
                + " | fecha: " + p.getFecha()
                + " | método pago: " + seguro(p.getMetodoPago())
                + " | dirección: " + recortar(seguro(p.getDireccionEntrega()), 80)
                + " | items: " + items;
    }

    private String formatearItem(PedidoItem item) {
        return item.getCantidad() + " x " + seguro(item.getProductoNombre()) + " (" + dinero(item.getSubtotal()) + ")";
    }

    private String dinero(BigDecimal valor) {
        if (valor == null) return "S/ 0.00";
        return "S/ " + valor.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private String seguro(String valor) {
        return valor == null || valor.isBlank() ? "No registrado" : valor.trim();
    }

    private String siNo(Boolean valor) {
        return Boolean.TRUE.equals(valor) ? "sí" : "no";
    }

    private String recortar(String valor, int max) {
        if (valor == null) return "";
        if (valor.length() <= max) return valor;
        return valor.substring(0, max - 3) + "...";
    }

    private boolean contiene(String texto, String... palabras) {
        for (String palabra : palabras) {
            if (texto.contains(normalizar(palabra))) return true;
        }
        return false;
    }

    private String normalizar(String texto) {
        String base = texto == null ? "" : texto.toLowerCase(Locale.ROOT);
        return Normalizer.normalize(base, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim();
    }

    public record ChatContext(String texto, boolean usandoDatosReales) {}
}