let productoActual = null;
let relacionados = [];
let cantidad = 1;

document.addEventListener("DOMContentLoaded", async () => {
    FastMarket.activarBuscador("buscador", "busqueda");
    FastMarket.activarMenuCliente();

    document.getElementById("sumar")?.addEventListener("click", () => cambiarCantidad(1));
    document.getElementById("restar")?.addEventListener("click", () => cambiarCantidad(-1));
    document.getElementById("agregar-carrito")?.addEventListener("click", () => agregarCarrito(false));
    document.getElementById("comprar-ahora")?.addEventListener("click", () => agregarCarrito(true));

    await cargarProducto();
});


function normalizarItemCarrito(item) {
    return {
        id: Number(item.productoId || item.id),
        nombre: item.nombre || "Producto",
        precio: Number(item.precio || 0),
        imagen: item.imagen || "img/logo.png",
        stock: Number(item.stockDisponible ?? item.stock ?? 0),
        cantidad: Number(item.cantidad || 1)
    };
}

async function obtenerCarritoActual() {
    try {
        const data = await FastMarket.obtenerCarrito();
        return (data.items || []).map(normalizarItemCarrito);
    } catch {
        return JSON.parse(localStorage.getItem("fastmarket_carrito") || localStorage.getItem("fashmarket_carrito") || "[]").map(normalizarItemCarrito);
    }
}

async function cargarProducto() {
    const id = new URLSearchParams(window.location.search).get("id");
    const mensaje = document.getElementById("mensaje-detalle");

    if (!id) {
        if (mensaje) mensaje.textContent = "Producto no encontrado.";
        return;
    }

    try {
        productoActual = await FastMarket.request(`/productos/${id}`);
        const todos = await FastMarket.request("/productos");
        relacionados = todos.filter((p) => Number(p.id) !== Number(id));
        pintarProducto();
        pintarRelacionados();
    } catch (error) {
        if (mensaje) mensaje.textContent = error.message;
    }
}

function pintarProducto() {
    if (!productoActual) return;

    const img = document.getElementById("producto-img");
    if (img) {
        img.src = productoActual.imagen || "img/logo.png";
        img.onerror = () => img.src = "img/logo.png";
    }

    setText("producto-categoria", productoActual.categoria);
    setText("producto-nombre", productoActual.nombre);
    setText("producto-descripcion", productoActual.descripcion);
    setText("producto-precio", FastMarket.money(productoActual.precio));
    setText("producto-precio-antes", productoActual.precioAntes ? FastMarket.money(productoActual.precioAntes) : "");

    const etiqueta = document.getElementById("etiqueta-oferta");
    if (etiqueta) etiqueta.classList.toggle("oculto", !productoActual.oferta);

    const agregar = document.getElementById("agregar-carrito");
    const comprar = document.getElementById("comprar-ahora");
    const sinStock = Number(productoActual.stock || 0) <= 0;

    if (agregar) agregar.disabled = sinStock;
    if (comprar) comprar.disabled = sinStock;
    if (sinStock) setText("mensaje-detalle", "Producto sin stock disponible.");
}

function cambiarCantidad(valor) {
    if (!productoActual) return;
    const max = Number(productoActual.stock || 0);
    cantidad = Math.max(1, Math.min(max || 1, cantidad + valor));
    setText("cantidad", cantidad);
}

async function agregarCarrito(irCheckout) {
    if (!productoActual) return;

    let carrito = await obtenerCarritoActual();
    const existente = carrito.find((item) => Number(item.id) === Number(productoActual.id));
    const actual = existente ? existente.cantidad : 0;

    if (actual + cantidad > Number(productoActual.stock || 0)) {
        setText("mensaje-detalle", "No hay stock suficiente.");
        return;
    }

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({
            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: Number(productoActual.precio),
            imagen: productoActual.imagen,
            stock: Number(productoActual.stock),
            cantidad
        });
    }

    await FastMarket.sincronizarCarrito(carrito, null).catch(() => localStorage.setItem("fastmarket_carrito", JSON.stringify(carrito)));
    setText("mensaje-detalle", "Producto agregado al carrito.");

    if (irCheckout) window.location.href = "checkout.html";
}

function pintarRelacionados() {
    const contenedor = document.getElementById("productos-relacionados");
    if (!contenedor || !productoActual) return;

    const lista = relacionados
        .filter((p) => p.categoria === productoActual.categoria)
        .slice(0, 4);

    const final = lista.length ? lista : relacionados.slice(0, 4);

    contenedor.innerHTML = final.map((p) => `
        <article class="card-relacionado">
            <img src="${FastMarket.escapeHTML(p.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(p.nombre)}" onerror="this.src='img/logo.png'">
            <h3>${FastMarket.escapeHTML(p.nombre)}</h3>
            <p>${FastMarket.money(p.precio)}</p>
            <a href="detalle-producto.html?id=${p.id}">Ver producto</a>
        </article>
    `).join("");
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
}
