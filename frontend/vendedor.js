let vendedor = null;
let productos = [];
let pedidos = [];
let cupones = [];
let productPage = { page: 0, size: 20, totalPages: 1 };

const estadosPedido = ["PENDIENTE", "CONFIRMADO", "PREPARANDO", "CAMINO", "ENTREGADO", "CANCELADO"];

document.addEventListener("DOMContentLoaded", async () => {
    vendedor = FastMarket.getCliente();
    if (!vendedor) {
        FastMarket.notify("Debes iniciar sesión como vendedor.", "warning");
        window.location.href = "login.html";
        return;
    }
    if (vendedor.rol === "ADMIN") {
        window.location.href = "admin.html";
        return;
    }
    if (vendedor.rol !== "VENDEDOR") {
        FastMarket.notify("No tienes permisos para acceder al panel vendedor.", "warning");
        window.location.href = "productos.html";
        return;
    }

    setText("nombre-vendedor", vendedor.nombre || "Vendedor");
    activarNavegacion();
    activarProductos();
    activarPedidos();
    activarCupones();
    document.getElementById("cerrar-sesion-vendedor")?.addEventListener("click", () => {
        FastMarket.cerrarSesion();
        window.location.href = "login.html";
    });

    await cargarTodo();
});

async function cargarTodo() {
    await Promise.allSettled([cargarProductos(), cargarPedidos(), cargarCupones()]);
    pintarMetricas();
}

function activarNavegacion() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-panel]");
        if (!btn) return;
        e.preventDefault();
        mostrarPanel(btn.dataset.panel);
    });
}

function mostrarPanel(id) {
    document.querySelectorAll(".vendor-panel").forEach((panel) => panel.classList.remove("activo"));
    document.getElementById(id)?.classList.add("activo");
    document.querySelectorAll(".vendor-nav button").forEach((btn) => btn.classList.toggle("activo", btn.dataset.panel === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function activarProductos() {
    document.getElementById("form-vendedor-producto")?.addEventListener("submit", guardarProducto);
    document.getElementById("vp-limpiar")?.addEventListener("click", limpiarProducto);
    document.getElementById("vp-buscar")?.addEventListener("input", pintarProductos);
    document.getElementById("vp-imagen-file")?.addEventListener("change", cargarImagenProducto);
    document.getElementById("vp-prev")?.addEventListener("click", async () => {
        if (productPage.page > 0) {
            productPage.page--;
            await cargarProductos();
        }
    });
    document.getElementById("vp-next")?.addEventListener("click", async () => {
        if (productPage.page + 1 < productPage.totalPages) {
            productPage.page++;
            await cargarProductos();
        }
    });
    document.getElementById("vp-tabla")?.addEventListener("click", async (e) => {
        const editar = e.target.closest("[data-editar-producto]");
        const eliminar = e.target.closest("[data-eliminar-producto]");
        if (editar) editarProducto(Number(editar.dataset.editarProducto));
        if (eliminar) await eliminarProducto(Number(eliminar.dataset.eliminarProducto));
    });
}

async function cargarProductos() {
    try {
        const page = await FastMarket.request(`/productos/page?page=${productPage.page}&size=${productPage.size}`, { auth: true });
        productos = Array.isArray(page?.content) ? page.content.filter((p) => p.activo !== false) : [];
        productPage.totalPages = Math.max(1, Number(page?.totalPages || 1));
        productPage.page = Math.min(Number(page?.number || 0), productPage.totalPages - 1);
        actualizarPaginacionProductos();
        pintarProductos();
        pintarMetricas();
    } catch (error) {
        toast(error.message);
    }
}

function pintarProductos() {
    const tbody = document.getElementById("vp-tabla");
    if (!tbody) return;
    const q = value("vp-buscar").toLowerCase();
    const lista = productos.filter((p) => `${p.nombre} ${p.descripcion} ${p.categoria}`.toLowerCase().includes(q));
    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="6">No tienes productos registrados.</td></tr>`;
    lista.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${FastMarket.escapeHTML(p.nombre)}</strong><br><small>${FastMarket.escapeHTML(p.descripcion || "")}</small></td>
            <td>${formatearCategoria(p.categoria)}</td>
            <td><strong>${FastMarket.money(p.precio)}</strong>${p.precioAntes ? `<br><small>Antes: ${FastMarket.money(p.precioAntes)}</small>` : ""}</td>
            <td>${stockBadge(p.stock)}</td>
            <td>${p.oferta ? `<span class="estado-oferta">Oferta</span>` : `<span class="estado-normal">Normal</span>`}</td>
            <td><button class="btn-mini" data-editar-producto="${p.id}">Editar</button> <button class="btn-mini secondary" data-eliminar-producto="${p.id}">Eliminar</button></td>`;
        tbody.appendChild(tr);
    });
}

async function guardarProducto(e) {
    e.preventDefault();
    const id = value("vp-id");
    const payload = {
        nombre: value("vp-nombre"),
        categoria: value("vp-categoria"),
        precio: Number(value("vp-precio")),
        precioAntes: value("vp-precio-antes") ? Number(value("vp-precio-antes")) : null,
        stock: Number(value("vp-stock")),
        imagen: value("vp-imagen") || "img/logo.png",
        descripcion: value("vp-descripcion"),
        oferta: checked("vp-oferta"),
        destacado: checked("vp-destacado")
    };

    if (!payload.nombre || !payload.categoria || payload.precio <= 0 || payload.stock < 0) {
        toast("Completa correctamente los datos del producto.");
        return;
    }

    try {
        await FastMarket.request(id ? `/productos/${id}` : "/productos", {
            method: id ? "PUT" : "POST",
            body: payload,
            auth: true
        });
        toast(id ? "Producto actualizado." : "Producto creado.");
        limpiarProducto();
        await cargarProductos();
    } catch (error) {
        toast(error.message);
    }
}

function editarProducto(id) {
    const p = productos.find((x) => Number(x.id) === Number(id));
    if (!p) return;
    setValue("vp-id", p.id);
    setValue("vp-nombre", p.nombre);
    setValue("vp-categoria", p.categoria);
    setValue("vp-precio", p.precio);
    setValue("vp-precio-antes", p.precioAntes || "");
    setValue("vp-stock", p.stock);
    setValue("vp-imagen", p.imagen || "");
    setValue("vp-descripcion", p.descripcion || "");
    setChecked("vp-oferta", !!p.oferta);
    setChecked("vp-destacado", !!p.destacado);
    setText("vp-form-title", "Editar producto");
    const img = document.getElementById("vp-preview-img");
    if (img) img.src = p.imagen || "img/logo.png";
    document.getElementById("vp-preview")?.classList.remove("oculto");
    mostrarPanel("panel-productos");
}

async function eliminarProducto(id) {
    if (!(await FastMarket.confirmAction("¿Seguro que deseas eliminar este producto?"))) return;
    try {
        await FastMarket.request(`/productos/${id}`, { method: "DELETE", auth: true });
        toast("Producto eliminado de tu catálogo.");
        await cargarProductos();
    } catch (error) {
        toast(error.message);
    }
}

function limpiarProducto() {
    document.getElementById("form-vendedor-producto")?.reset();
    setValue("vp-id", "");
    setValue("vp-imagen", "");
    setText("vp-form-title", "Agregar producto");
    document.getElementById("vp-preview")?.classList.add("oculto");
}

function cargarImagenProducto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Selecciona una imagen válida.");
    const reader = new FileReader();
    reader.onload = () => {
        setValue("vp-imagen", reader.result);
        const img = document.getElementById("vp-preview-img");
        if (img) img.src = reader.result;
        document.getElementById("vp-preview")?.classList.remove("oculto");
    };
    reader.readAsDataURL(file);
}

function actualizarPaginacionProductos() {
    setText("vp-page-info", `Página ${productPage.page + 1} de ${productPage.totalPages}`);
    const prev = document.getElementById("vp-prev");
    const next = document.getElementById("vp-next");
    if (prev) prev.disabled = productPage.page <= 0;
    if (next) next.disabled = productPage.page + 1 >= productPage.totalPages;
}

function activarPedidos() {
    document.getElementById("vp-pedidos")?.addEventListener("change", async (e) => {
        const select = e.target.closest("[data-estado-pedido]");
        if (!select) return;
        await actualizarEstadoPedido(Number(select.dataset.estadoPedido), select.value);
    });
    document.getElementById("vp-pedidos")?.addEventListener("click", async (e) => {
        const historial = e.target.closest("[data-historial-pedido]");
        if (historial) await verHistorialPedido(Number(historial.dataset.historialPedido));
    });
}

async function cargarPedidos() {
    try {
        pedidos = await FastMarket.request(`/pedidos/vendedor/${vendedor.id}`, { auth: true });
        pintarPedidos();
        pintarMetricas();
    } catch (error) {
        toast(error.message);
    }
}

function pintarPedidos() {
    const tbody = document.getElementById("vp-pedidos");
    if (!tbody) return;
    tbody.innerHTML = pedidos.length ? "" : `<tr><td colspan="7">Todavía no tienes pedidos vinculados.</td></tr>`;
    pedidos.forEach((p) => {
        const productosTexto = (p.items || []).map((i) => `${i.productoNombre} x${i.cantidad}`).join(", ");
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${FastMarket.escapeHTML(p.codigo)}</strong><br><small>${fecha(p.fecha)}</small></td>
            <td>${FastMarket.escapeHTML(p.usuarioNombre || "Cliente")}</td>
            <td>${FastMarket.escapeHTML(productosTexto)}</td>
            <td>${FastMarket.money(p.total)}</td>
            <td>${FastMarket.estadoTexto(p.estado)}</td>
            <td><select data-estado-pedido="${p.id}">${estadosPedido.map((estado) => `<option value="${estado}" ${FastMarket.normalizarEstado(p.estado) === estado ? "selected" : ""}>${FastMarket.estadoTexto(estado)}</option>`).join("")}</select></td>
            <td><button class="btn-mini secondary" data-historial-pedido="${p.id}">Ver</button></td>`;
        tbody.appendChild(tr);
    });
}

async function actualizarEstadoPedido(id, estado) {
    try {
        await FastMarket.request(`/pedidos/${id}/estado?estado=${estado}`, { method: "PUT", auth: true });
        toast("Estado actualizado.");
        await cargarPedidos();
    } catch (error) {
        toast(error.message);
    }
}

async function verHistorialPedido(id) {
    const panel = document.getElementById("vp-historial-pedido");
    if (!panel) return;
    try {
        const historial = await FastMarket.request(`/pedidos/${id}/historial`, { auth: true });
        panel.classList.remove("oculto");
        panel.innerHTML = `<h3>Historial del pedido</h3>${pintarHistorialPedido(historial)}`;
    } catch (error) {
        toast(error.message);
    }
}

function pintarHistorialPedido(historial) {
    if (!historial?.length) return `<p>No hay historial registrado.</p>`;
    return `<ul>${historial.map((h) => `<li><strong>${fecha(h.fecha)}</strong> — ${FastMarket.estadoTexto(h.estadoAnterior || "CREADO")} → ${FastMarket.estadoTexto(h.estadoNuevo)} por ${FastMarket.escapeHTML(h.actorNombre || "Sistema")}</li>`).join("")}</ul>`;
}

function activarCupones() {
    document.getElementById("form-vendedor-cupon")?.addEventListener("submit", guardarCupon);
    document.getElementById("vc-limpiar")?.addEventListener("click", limpiarCupon);
    document.getElementById("vc-buscar")?.addEventListener("input", pintarCupones);
    document.getElementById("vc-tabla")?.addEventListener("click", async (e) => {
        const editar = e.target.closest("[data-editar-cupon]");
        const eliminar = e.target.closest("[data-eliminar-cupon]");
        const usos = e.target.closest("[data-usos-cupon]");
        if (editar) editarCupon(Number(editar.dataset.editarCupon));
        if (eliminar) await eliminarCupon(Number(eliminar.dataset.eliminarCupon));
        if (usos) await verUsosCupon(Number(usos.dataset.usosCupon));
    });
}

async function cargarCupones() {
    try {
        cupones = await FastMarket.request("/cupones", { auth: true });
        pintarCupones();
        pintarMetricas();
    } catch (error) {
        toast(error.message);
    }
}

function pintarCupones() {
    const tbody = document.getElementById("vc-tabla");
    if (!tbody) return;
    const q = value("vc-buscar").toLowerCase();
    const lista = cupones.filter((c) => `${c.codigo} ${c.descripcion}`.toLowerCase().includes(q));
    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="5">No tienes cupones registrados.</td></tr>`;
    lista.forEach((c) => {
        const descuento = `${Number(c.porcentaje || 0) > 0 ? `${c.porcentaje}%` : ""}${Number(c.montoFijo || 0) > 0 ? ` S/ ${Number(c.montoFijo).toFixed(2)}` : ""}`.trim();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${FastMarket.escapeHTML(c.codigo)}</strong><br><small>${FastMarket.escapeHTML(c.descripcion || "")}</small></td>
            <td>${descuento || "-"}<br><small>Mín: ${FastMarket.money(c.montoMinimo || 0)}</small></td>
            <td>${c.usosActuales || 0}${c.usosMaximos ? `/${c.usosMaximos}` : ""}</td>
            <td><span class="${c.activo ? "estado-activo" : "estado-inactivo"}">${c.activo ? "Activo" : "Inactivo"}</span></td>
            <td><button class="btn-mini" data-editar-cupon="${c.id}">Editar</button> <button class="btn-mini secondary" data-usos-cupon="${c.id}">Usos</button> <button class="btn-mini secondary" data-eliminar-cupon="${c.id}">Eliminar</button></td>`;
        tbody.appendChild(tr);
    });
}

async function guardarCupon(e) {
    e.preventDefault();
    const id = value("vc-id");
    const payload = {
        codigo: value("vc-codigo"),
        descripcion: value("vc-descripcion"),
        tipo: "VENDEDOR",
        porcentaje: Number(value("vc-porcentaje") || 0),
        montoFijo: Number(value("vc-monto") || 0),
        montoMinimo: Number(value("vc-minimo") || 0),
        usosMaximos: value("vc-usos") ? Number(value("vc-usos")) : null,
        activo: checked("vc-activo")
    };
    if (!payload.codigo) return toast("Ingresa el código del cupón.");
    if (payload.porcentaje <= 0 && payload.montoFijo <= 0) return toast("Ingresa porcentaje o monto fijo.");
    try {
        await FastMarket.request(id ? `/cupones/${id}` : "/cupones", { method: id ? "PUT" : "POST", body: payload, auth: true });
        toast(id ? "Cupón actualizado." : "Cupón creado.");
        limpiarCupon();
        await cargarCupones();
    } catch (error) {
        toast(error.message);
    }
}

function editarCupon(id) {
    const c = cupones.find((x) => Number(x.id) === Number(id));
    if (!c) return;
    setValue("vc-id", c.id);
    setValue("vc-codigo", c.codigo || "");
    setValue("vc-descripcion", c.descripcion || "");
    setValue("vc-porcentaje", c.porcentaje || "");
    setValue("vc-monto", c.montoFijo || "");
    setValue("vc-minimo", c.montoMinimo || "");
    setValue("vc-usos", c.usosMaximos || "");
    setChecked("vc-activo", !!c.activo);
    setText("vc-form-title", "Editar cupón");
    mostrarPanel("panel-cupones");
}

async function verUsosCupon(id) {
    const panel = document.getElementById("vc-usos-panel");
    if (!panel) return;
    try {
        const usos = await FastMarket.request(`/cupones/${id}/usos`, { auth: true });
        panel.classList.remove("oculto");
        panel.innerHTML = `<h3>Usos del cupón</h3>${usos?.length ? `<ul>${usos.map((u) => `<li><strong>${fecha(u.fecha)}</strong> — ${FastMarket.escapeHTML(u.usuarioNombre || "Cliente")} ahorró ${FastMarket.money(u.descuentoAplicado)} en ${FastMarket.escapeHTML(u.pedidoCodigo || "pedido")}</li>`).join("")}</ul>` : `<p>Este cupón todavía no tiene usos.</p>`}`;
    } catch (error) {
        toast(error.message);
    }
}

async function eliminarCupon(id) {
    if (!(await FastMarket.confirmAction("¿Seguro que deseas desactivar este cupón?"))) return;
    try {
        await FastMarket.request(`/cupones/${id}`, { method: "DELETE", auth: true });
        toast("Cupón desactivado.");
        await cargarCupones();
    } catch (error) {
        toast(error.message);
    }
}

function limpiarCupon() {
    document.getElementById("form-vendedor-cupon")?.reset();
    setValue("vc-id", "");
    setChecked("vc-activo", true);
    setText("vc-form-title", "Agregar cupón");
}

function pintarMetricas() {
    setText("metric-productos", productos.length);
    setText("metric-pedidos", pedidos.length);
    setText("metric-ventas", FastMarket.money(pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0)));
    setText("metric-cupones", cupones.length);
}

function stockBadge(stock) {
    const n = Number(stock || 0);
    if (n <= 0) return `<span class="stock-empty">Agotado</span>`;
    if (n <= 5) return `<span class="stock-low">Bajo · ${n}</span>`;
    return `<span class="stock-ok">${n} unidades</span>`;
}

function formatearCategoria(valor) {
    const map = { moda: "Moda", tecnologia: "Tecnología", hogar: "Hogar", accesorios: "Accesorios", estudio: "Estudio" };
    return map[valor] || valor || "";
}

function value(id) { return String(document.getElementById(id)?.value || "").trim(); }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ""; }
function checked(id) { return !!document.getElementById(id)?.checked; }
function setChecked(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val ?? ""; }
function fecha(valor) { return valor ? new Date(valor).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : ""; }
function toast(mensaje) { FastMarket.notify ? FastMarket.notify(mensaje) : alert(mensaje); }
