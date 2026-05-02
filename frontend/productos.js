let productos = [];
let bannersActivos = [];
let carrito = JSON.parse(localStorage.getItem("fastmarket_carrito")) || [];
let cuponAplicado = JSON.parse(localStorage.getItem("fastmarket_cupon") || "null");

let categoriaActual = "todos";
let busquedaActual = "";
let ordenActual = "normal";
let slideActual = 0;
let intervaloSlider = null;

document.addEventListener("DOMContentLoaded", async () => {
    FastMarket.activarBuscador("buscador-header", "busqueda");
    FastMarket.activarMenuCliente();
    FastMarket.mostrarPanelCliente();
    FastMarket.activarChatBasico();

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
        const buscarProducto = document.getElementById("buscar-producto");
        if (buscarProducto) buscarProducto.value = q;
        busquedaActual = q.toLowerCase();
    }

    activarEventos();
    actualizarContadorCarrito();
    mostrarCarrito();
    await cargarBanners();
    await cargarProductos();
});

function activarEventos() {
    const buscarProducto = document.getElementById("buscar-producto");
    const ordenarProducto = document.getElementById("ordenar-producto");
    const botonesCategoria = document.querySelectorAll(".categoria-btn");
    const btnAnterior = document.getElementById("anterior");
    const btnSiguiente = document.getElementById("siguiente");
    const carritoIcono = document.getElementById("carrito");
    const cerrarCarrito = document.getElementById("cerrar-carrito");
    const overlayCarrito = document.getElementById("overlay-carrito");
    const finalizarCompra = document.getElementById("finalizar-compra");
    const vaciarCarrito = document.getElementById("vaciar-carrito");
    const listaCarrito = document.getElementById("carrito-lista");
    const btnCupon = document.getElementById("aplicar-cupon-carrito");
    const inputCupon = document.getElementById("cupon-carrito");

    if (buscarProducto) {
        buscarProducto.addEventListener("input", () => {
            busquedaActual = buscarProducto.value.toLowerCase().trim();
            mostrarProductos();
        });
    }

    if (ordenarProducto) {
        ordenarProducto.addEventListener("change", () => {
            ordenActual = ordenarProducto.value;
            mostrarProductos();
        });
    }

    botonesCategoria.forEach((btn) => {
        btn.addEventListener("click", () => {
            botonesCategoria.forEach((b) => b.classList.remove("activo"));
            btn.classList.add("activo");
            categoriaActual = btn.dataset.categoria || "todos";
            mostrarProductos();
        });
    });

    if (btnAnterior) btnAnterior.addEventListener("click", () => moverSlide(-1));
    if (btnSiguiente) btnSiguiente.addEventListener("click", () => moverSlide(1));
    if (carritoIcono) carritoIcono.addEventListener("click", (e) => {
        e.preventDefault();
        abrirCarrito();
    });
    if (cerrarCarrito) cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
    if (overlayCarrito) overlayCarrito.addEventListener("click", cerrarPanelCarrito);
    if (vaciarCarrito) vaciarCarrito.addEventListener("click", () => {
        carrito = [];
        guardarCarrito();
    });
    if (finalizarCompra) finalizarCompra.addEventListener("click", () => {
        if (carrito.length === 0) {
            FastMarket.notify("Tu carrito está vacío.", "warning");
            return;
        }
        window.location.href = "checkout.html";
    });
    if (inputCupon && cuponAplicado?.codigo) inputCupon.value = cuponAplicado.codigo;
    if (btnCupon) btnCupon.addEventListener("click", aplicarCuponCarrito);

    if (listaCarrito) {
        listaCarrito.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-accion]");
            if (!btn) return;
            cambiarCantidad(Number(btn.dataset.id), btn.dataset.accion);
        });
    }
}

async function cargarProductos() {
    const contenedor = document.getElementById("productos-contenedor");
    try {
        productos = await FastMarket.request("/productos");
        mostrarProductos();
    } catch (error) {
        if (contenedor) {
            contenedor.innerHTML = `<div class="mensaje-error">No se pudieron cargar productos: ${FastMarket.escapeHTML(error.message)}</div>`;
        }
    }
}

async function cargarBanners() {
    try {
        const banners = await FastMarket.request("/banners?activo=true");
        bannersActivos = banners.length ? banners : [
            { titulo: "", descripcion: "", imagen: "img/fondo1.png" },
            { titulo: "", descripcion: "", imagen: "img/intro.png" }
        ];
    } catch {
        bannersActivos = [
            { titulo: "", descripcion: "", imagen: "img/fondo1.png" },
            { titulo: "", descripcion: "", imagen: "img/intro.png" }
        ];
    }
    pintarSlider();
}

function pintarSlider() {
    const slider = document.getElementById("slider-contenedor");
    const puntos = document.getElementById("puntos");
    if (!slider || !puntos) return;

    slider.innerHTML = "";
    puntos.innerHTML = "";

    bannersActivos.forEach((banner, index) => {
        const slide = document.createElement("div");
        slide.className = "slide";
        const titulo = banner.titulo || "";
        const descripcion = banner.descripcion || "";
        slide.innerHTML = `
            <img src="${FastMarket.escapeHTML(banner.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(titulo || "Banner FastMarket")}" onerror="this.src='img/logo.png'">
            ${(titulo || descripcion) ? `
                <div class="slide-info">
                    ${titulo ? `<h2>${FastMarket.escapeHTML(titulo)}</h2>` : ""}
                    ${descripcion ? `<p>${FastMarket.escapeHTML(descripcion)}</p>` : ""}
                </div>` : ""}`;
        slider.appendChild(slide);

        const punto = document.createElement("span");
        punto.className = "punto";
        punto.addEventListener("click", () => {
            slideActual = index;
            actualizarSlider();
        });
        puntos.appendChild(punto);
    });

    slideActual = 0;
    actualizarSlider();
    clearInterval(intervaloSlider);
    intervaloSlider = setInterval(() => moverSlide(1), 5000);
}

function moverSlide(direccion) {
    if (!bannersActivos.length) return;
    slideActual = (slideActual + direccion + bannersActivos.length) % bannersActivos.length;
    actualizarSlider();
}

function actualizarSlider() {
    const slider = document.getElementById("slider-contenedor");
    const puntos = document.querySelectorAll(".punto");
    if (slider) slider.style.transform = `translateX(-${slideActual * 100}%)`;
    puntos.forEach((p, i) => p.classList.toggle("activo", i === slideActual));
}

function mostrarProductos() {
    const contenedor = document.getElementById("productos-contenedor");
    const mensajeVacio = document.getElementById("mensaje-vacio");
    if (!contenedor) return;

    let lista = productos.filter((p) => {
        const categoriaOk = categoriaActual === "todos" || p.categoria === categoriaActual;
        const texto = `${p.nombre} ${p.descripcion} ${p.categoria}`.toLowerCase();
        return categoriaOk && texto.includes(busquedaActual);
    });

    if (ordenActual === "precio-menor") lista.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (ordenActual === "precio-mayor") lista.sort((a, b) => Number(b.precio) - Number(a.precio));
    if (ordenActual === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (ordenActual === "ofertas") lista = lista.filter((p) => p.oferta);

    contenedor.innerHTML = "";
    if (mensajeVacio) mensajeVacio.style.display = lista.length ? "none" : "block";

    lista.forEach((producto) => {
        const card = document.createElement("article");
        card.className = "producto-card";
        card.tabIndex = 0;
        card.setAttribute("role", "link");
        card.setAttribute("aria-label", `Ver detalle de ${producto.nombre}`);

        const sinStock = Number(producto.stock) <= 0;
        const detalleUrl = `detalle-producto.html?id=${producto.id}`;

        card.innerHTML = `
            <div class="producto-imagen-link">
                <img src="${FastMarket.escapeHTML(producto.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(producto.nombre)}" onerror="this.src='img/logo.png'">
                <div class="badges-producto">
                    ${producto.oferta ? `<span class="badge-oferta">Oferta</span>` : ""}
                    ${sinStock ? `<span class="badge-stock">Sin stock</span>` : ""}
                </div>
            </div>
            <div class="producto-info">
                <p class="categoria-producto">${FastMarket.escapeHTML(producto.categoria || "General")}</p>
                <h3>${FastMarket.escapeHTML(producto.nombre)}</h3>
                <p class="descripcion-producto">${FastMarket.escapeHTML(producto.descripcion || "Producto disponible en FastMarket.")}</p>
                <div class="precio-box">
                    <strong>${FastMarket.money(producto.precio)}</strong>
                    ${producto.precioAntes ? `<span>${FastMarket.money(producto.precioAntes)}</span>` : ""}
                </div>
                <small class="stock-producto">Stock: ${Number(producto.stock || 0)}</small>
                <button class="btn-agregar" ${sinStock ? "disabled" : ""}>Agregar al carrito</button>
            </div>`;

        card.addEventListener("click", () => {
            window.location.href = detalleUrl;
        });

        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.location.href = detalleUrl;
            }
        });

        const btnAgregar = card.querySelector(".btn-agregar");
        if (btnAgregar) {
            btnAgregar.addEventListener("click", (e) => {
                e.stopPropagation();
                agregarAlCarrito(producto, 1);
            });
        }

        contenedor.appendChild(card);
    });
}

function agregarAlCarrito(producto, cantidad) {
    const item = carrito.find((p) => Number(p.id) === Number(producto.id));
    const cantidadActual = item ? item.cantidad : 0;
    if (cantidadActual + cantidad > Number(producto.stock)) {
        FastMarket.notify("No hay stock suficiente para ese producto.", "warning");
        return;
    }

    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen: producto.imagen,
            stock: Number(producto.stock),
            cantidad
        });
    }

    guardarCarrito();
    abrirCarrito();
}

function cambiarCantidad(id, accion) {
    const item = carrito.find((p) => Number(p.id) === Number(id));
    if (!item) return;

    if (accion === "sumar") {
        if (item.cantidad >= Number(item.stock || 0)) {
            FastMarket.notify("No hay más stock disponible.", "warning");
            return;
        }
        item.cantidad++;
    }

    if (accion === "restar") item.cantidad--;
    if (accion === "eliminar" || item.cantidad <= 0) {
        carrito = carrito.filter((p) => Number(p.id) !== Number(id));
    }

    guardarCarrito();
}

function guardarCarrito() {
    const codigo = carrito.length ? cuponAplicado?.codigo || null : null;
    if (carrito.length === 0) cuponAplicado = null;
    FastMarket.sincronizarCarrito(carrito, codigo).catch(() => {
        localStorage.setItem("fastmarket_carrito", JSON.stringify(carrito));
        if (!codigo) localStorage.removeItem("fastmarket_cupon");
    });
    actualizarContadorCarrito();
    mostrarCarrito();
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    if (contador) contador.textContent = carrito.reduce((s, p) => s + Number(p.cantidad), 0);
}

function mostrarCarrito() {
    const lista = document.getElementById("carrito-lista");
    const total = document.getElementById("total-carrito");
    const subtotalEl = document.getElementById("subtotal-carrito");
    const descuentoEl = document.getElementById("descuento-carrito");
    const filaDescuento = document.getElementById("fila-descuento-carrito");
    if (!lista || !total) return;

    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío.</p>`;
        if (subtotalEl) subtotalEl.textContent = FastMarket.money(0);
        if (descuentoEl) descuentoEl.textContent = `- ${FastMarket.money(0)}`;
        filaDescuento?.classList.add("oculto");
        total.textContent = FastMarket.money(0);
        return;
    }

    carrito.forEach((item) => {
        const div = document.createElement("div");
        div.className = "item-carrito";
        div.innerHTML = `
            <img src="${FastMarket.escapeHTML(item.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(item.nombre)}" onerror="this.src='img/logo.png'">
            <div>
                <h4>${FastMarket.escapeHTML(item.nombre)}</h4>
                <p>${FastMarket.money(item.precio)}</p>
                <div class="cantidad-carrito">
                    <button data-accion="restar" data-id="${item.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button data-accion="sumar" data-id="${item.id}">+</button>
                    <button data-accion="eliminar" data-id="${item.id}">Eliminar</button>
                </div>
            </div>`;
        lista.appendChild(div);
    });

    const suma = carrito.reduce((s, p) => s + Number(p.precio) * Number(p.cantidad), 0);
    const descuento = Number(cuponAplicado?.descuento || 0);
    if (subtotalEl) subtotalEl.textContent = FastMarket.money(suma);
    if (descuentoEl) descuentoEl.textContent = `- ${FastMarket.money(descuento)}`;
    filaDescuento?.classList.toggle("oculto", descuento <= 0);
    total.textContent = FastMarket.money(Math.max(0, suma - descuento));
}

async function aplicarCuponCarrito() {
    const input = document.getElementById("cupon-carrito");
    const mensaje = document.getElementById("mensaje-cupon-carrito");
    const codigo = input?.value.trim().toUpperCase();

    const pintar = (texto, tipo) => {
        if (!mensaje) return;
        mensaje.textContent = texto;
        mensaje.classList.remove("ok", "error");
        mensaje.classList.add(tipo);
    };

    if (!codigo) {
        cuponAplicado = null;
        FastMarket.sincronizarCarrito(carrito, null).catch(() => localStorage.removeItem("fastmarket_cupon"));
        pintar("Cupón eliminado.", "ok");
        mostrarCarrito();
        return;
    }

    if (!carrito.length) {
        pintar("Agrega productos antes de aplicar un cupón.", "error");
        return;
    }

    try {
        pintar("Validando cupón...", "ok");
        const respuesta = await FastMarket.request("/cupones/aplicar", {
            method: "POST",
            body: {
                codigo,
                items: carrito.map((item) => ({ productoId: Number(item.id), cantidad: Number(item.cantidad) }))
            }
        });
        cuponAplicado = respuesta;
        await FastMarket.sincronizarCarrito(carrito, cuponAplicado.codigo);
        pintar(`${respuesta.mensaje} Descuento: ${FastMarket.money(respuesta.descuento)}`, "ok");
        mostrarCarrito();
    } catch (error) {
        cuponAplicado = null;
        await FastMarket.sincronizarCarrito(carrito, null).catch(() => localStorage.removeItem("fastmarket_cupon"));
        pintar(error.message, "error");
        mostrarCarrito();
    }
}

function abrirCarrito() {
    const overlay = document.getElementById("overlay-carrito");
    const panel = document.getElementById("panel-carrito");
    if (overlay) overlay.classList.add("activo");
    if (panel) panel.classList.add("activo");
    mostrarCarrito();
}

function cerrarPanelCarrito() {
    const overlay = document.getElementById("overlay-carrito");
    const panel = document.getElementById("panel-carrito");
    if (overlay) overlay.classList.remove("activo");
    if (panel) panel.classList.remove("activo");
}
