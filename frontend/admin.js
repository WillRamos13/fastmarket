let productos = [];
let banners = [];
let pedidos = [];
let usuarios = [];
let indexContenidos = [];
let cupones = [];
let vendedores = [];
let usuarioActual = null;
const TIPOS_INDEX_PERMITIDOS = ["destacado", "promocion", "opinion", "ayuda"];
const adminPages = { productos: { page: 0, size: 20, totalPages: 1 }, pedidos: { page: 0, size: 20, totalPages: 1 } };
let filtroVendedorProductos = "todos";
let filtroVendedorPedidos = "todos";

document.addEventListener("DOMContentLoaded", async () => {
    const admin = FastMarket.getCliente();
    if (!admin) {
        FastMarket.notify("Debes iniciar sesión.", "warning");
        window.location.href = "login.html";
        return;
    }
    if (admin.rol === "VENDEDOR") {
        window.location.href = "vendedor.html";
        return;
    }
    if (admin.rol !== "ADMIN") {
        FastMarket.notify("No tienes permisos para entrar al panel administrador.", "warning");
        window.location.href = "productos.html";
        return;
    }
    usuarioActual = admin;
    document.body.classList.toggle("modo-vendedor", false);
    setText("nombre-admin", admin.nombre || (admin.rol === "VENDEDOR" ? "Vendedor" : "Administrador"));
    activarMenu();
    activarPaneles();
    activarProductos();
    activarBanners();
    activarPedidos();
    activarUsuarios();
    activarCupones();
    activarIndex();
    activarPowerBI();
    configurarPermisosPanel();
    marcarMenuActivo("panel-inicio");

    await cargarTodo();
});

async function cargarTodo() {
    await Promise.allSettled([
        cargarProductos(),
        cargarBanners(),
        cargarPedidos(),
        cargarUsuarios(),
        cargarCupones(),
        cargarVendedores(),
        cargarIndices(),
        usuarioActual?.rol === "ADMIN" ? cargarIndexContenidos() : Promise.resolve()
    ]);
    pintarVendedoresAdmin();
    cargarPowerBI();
}

function activarMenu() {
    const btn = document.getElementById("btn-menu-admin");
    const opciones = document.getElementById("opciones-admin");
    const salir = document.getElementById("cerrar-sesion");

    btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        opciones?.classList.toggle("activo");
    });

    document.addEventListener("click", () => opciones?.classList.remove("activo"));

    salir?.addEventListener("click", (e) => {
        e.preventDefault();
        FastMarket.cerrarSesion();
        window.location.href = "login.html";
    });
}

function activarPaneles() {
    document.addEventListener("click", async (e) => {
        const productosVendor = e.target.closest("[data-ver-productos-vendedor]");
        if (productosVendor) {
            e.preventDefault();
            filtroVendedorProductos = productosVendor.dataset.verProductosVendedor;
            const select = document.getElementById("filtro-vendedor-productos");
            if (select) select.value = filtroVendedorProductos;
            adminPages.productos.page = 0;
            await cargarProductos();
            mostrarPanel("panel-productos");
            return;
        }

        const pedidosVendor = e.target.closest("[data-ver-pedidos-vendedor]");
        if (pedidosVendor) {
            e.preventDefault();
            filtroVendedorPedidos = pedidosVendor.dataset.verPedidosVendedor;
            const select = document.getElementById("filtro-vendedor-pedidos");
            if (select) select.value = filtroVendedorPedidos;
            adminPages.pedidos.page = 0;
            await cargarPedidos();
            mostrarPanel("panel-ventas");
            return;
        }

        const btn = e.target.closest("[data-panel]");
        if (!btn) return;
        e.preventDefault();
        if (btn.dataset.panel === "panel-productos") {
            filtroVendedorProductos = "todos";
            const select = document.getElementById("filtro-vendedor-productos");
            if (select) select.value = "todos";
            adminPages.productos.page = 0;
            await cargarProductos();
        }
        if (btn.dataset.panel === "panel-ventas") {
            filtroVendedorPedidos = "todos";
            const select = document.getElementById("filtro-vendedor-pedidos");
            if (select) select.value = "todos";
            adminPages.pedidos.page = 0;
            await cargarPedidos();
        }
        mostrarPanel(btn.dataset.panel);
    });
}

function mostrarPanel(id) {
    document.querySelectorAll(".panel-admin").forEach((panel) => panel.classList.remove("activo"));
    document.getElementById(id)?.classList.add("activo");
    document.getElementById("opciones-admin")?.classList.remove("activo");
    marcarMenuActivo(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function marcarMenuActivo(id) {
    document.querySelectorAll("#opciones-admin [data-panel]").forEach((btn) => {
        btn.classList.toggle("activo", btn.dataset.panel === id);
    });
}

/* PRODUCTOS */

function activarProductos() {
    document.getElementById("form-producto")?.addEventListener("submit", guardarProducto);
    document.getElementById("btn-limpiar")?.addEventListener("click", limpiarProducto);
    document.getElementById("imagen-producto")?.addEventListener("change", (e) => cargarImagen(e, "imagen-producto-valor", "preview-producto", "preview-producto-img"));
    document.getElementById("buscar-admin")?.addEventListener("input", pintarProductos);
    document.getElementById("filtro-categoria")?.addEventListener("change", pintarProductos);
    document.getElementById("filtro-vendedor-productos")?.addEventListener("change", async (e) => {
        filtroVendedorProductos = e.target.value || "todos";
        adminPages.productos.page = 0;
        await cargarProductos();
    });
    document.getElementById("btn-productos-generales")?.addEventListener("click", async () => {
        filtroVendedorProductos = "general";
        const select = document.getElementById("filtro-vendedor-productos");
        if (select) select.value = "general";
        adminPages.productos.page = 0;
        await cargarProductos();
        mostrarPanel("panel-productos");
    });
    document.getElementById("btn-productos-todos")?.addEventListener("click", async () => {
        filtroVendedorProductos = "todos";
        const select = document.getElementById("filtro-vendedor-productos");
        if (select) select.value = "todos";
        adminPages.productos.page = 0;
        await cargarProductos();
        mostrarPanel("panel-productos");
    });
    document.getElementById("productos-prev")?.addEventListener("click", async () => { if (adminPages.productos.page > 0) { adminPages.productos.page--; await cargarProductos(); } });
    document.getElementById("productos-next")?.addEventListener("click", async () => { if (adminPages.productos.page + 1 < adminPages.productos.totalPages) { adminPages.productos.page++; await cargarProductos(); } });
    document.getElementById("tabla-productos")?.addEventListener("click", async (e) => {
        const editar = e.target.closest("[data-editar-producto]");
        const eliminar = e.target.closest("[data-eliminar-producto]");
        if (editar) editarProducto(Number(editar.dataset.editarProducto));
        if (eliminar) await eliminarProducto(Number(eliminar.dataset.eliminarProducto));
    });
}

async function cargarProductos() {
    try {
        if (filtroVendedorProductos !== "todos") {
            const lista = await FastMarket.request(filtroVendedorProductos === "general" ? "/productos?incluirInactivos=true" : `/productos?vendedorId=${Number(filtroVendedorProductos)}`, { auth: true });
            productos = Array.isArray(lista) ? lista.filter((p) => p.activo !== false) : [];
            if (filtroVendedorProductos === "general") productos = productos.filter((p) => !p.vendedorId);
            adminPages.productos.totalPages = 1;
            adminPages.productos.page = 0;
        } else {
            const page = await FastMarket.request(`/productos/page?page=${adminPages.productos.page}&size=${adminPages.productos.size}`, { auth: true });
            productos = Array.isArray(page?.content) ? page.content.filter((p) => p.activo !== false) : [];
            adminPages.productos.totalPages = Math.max(1, Number(page?.totalPages || 1));
            adminPages.productos.page = Math.min(Number(page?.number || 0), adminPages.productos.totalPages - 1);
        }
        actualizarPaginacion("productos");
        actualizarTituloProductos();
        poblarSelectProductosCupon();
        pintarProductos();
    } catch (error) {
        toast(error.message);
    }
}

function actualizarTituloProductos() {
    const titulo = document.getElementById("titulo-productos-admin");
    const subtitulo = document.getElementById("subtitulo-productos-admin");
    if (!titulo || !subtitulo) return;
    if (filtroVendedorProductos === "todos") {
        titulo.textContent = "Catálogo general de productos";
        subtitulo.textContent = "Vista administrativa completa: productos de tienda y productos asignados a vendedores.";
        return;
    }
    if (filtroVendedorProductos === "general") {
        titulo.textContent = "Productos generales de la tienda";
        subtitulo.textContent = "Solo productos propios de FastMarket, sin vendedor asignado.";
        return;
    }
    const vendedor = vendedores.find((v) => Number(v.id) === Number(filtroVendedorProductos));
    titulo.textContent = `Productos de ${vendedor?.nombre || "vendedor"}`;
    subtitulo.textContent = "Vista filtrada: aquí solo aparecen los productos del vendedor seleccionado.";
}

function pintarProductos() {
    const tbody = document.getElementById("tabla-productos");
    if (!tbody) return;

    const texto = document.getElementById("buscar-admin")?.value.toLowerCase().trim() || "";
    const categoria = document.getElementById("filtro-categoria")?.value || "todos";

    const lista = productos.filter((p) => {
        const textoOk = `${p.nombre} ${p.descripcion} ${p.categoria}`.toLowerCase().includes(texto);
        const catOk = categoria === "todos" || p.categoria === categoria;
        return textoOk && catOk;
    });

    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="8">No hay productos.</td></tr>`;

    lista.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${FastMarket.escapeHTML(p.imagen || "img/logo.png")}" class="img-tabla" alt="${FastMarket.escapeHTML(p.nombre)}" onerror="this.src='img/logo.png'"></td>
            <td><strong>${FastMarket.escapeHTML(p.nombre)}</strong><br><small>${FastMarket.escapeHTML(p.descripcion || "")}</small></td>
            <td>${formatearCategoria(p.categoria)}</td>
            <td><strong>${FastMarket.money(p.precio)}</strong>${p.precioAntes ? `<br><small>Antes: ${FastMarket.money(p.precioAntes)}</small>` : ""}</td>
            <td>${stockBadge(p.stock)}</td>
            <td>
                <span class="${p.oferta ? "estado-oferta" : "estado-normal"}">${p.oferta ? "Oferta" : "Normal"}</span>
                ${p.destacado ? `<br><small>Destacado</small>` : ""}
            </td>
            <td>${FastMarket.escapeHTML(p.vendedorNombre || "Tienda")}</td>
            <td>
                <button class="btn-editar" data-editar-producto="${p.id}">Editar</button>
                <button class="btn-eliminar" data-eliminar-producto="${p.id}">Eliminar</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

async function guardarProducto(e) {
    e.preventDefault();

    const id = value("producto-id");
    const payload = {
        nombre: value("nombre"),
        categoria: value("categoria"),
        precio: Number(value("precio")),
        precioAntes: value("precioAntes") ? Number(value("precioAntes")) : null,
        stock: Number(value("stock")),
        imagen: value("imagen-producto-valor") || "img/logo.png",
        descripcion: value("descripcion"),
        oferta: checked("oferta"),
        destacado: checked("destacado"),
        vendedorId: value("producto-vendedor") ? Number(value("producto-vendedor")) : null
    };

    if (!payload.nombre || !payload.categoria || payload.precio <= 0 || payload.stock < 0) {
        toast("Completa los datos del producto correctamente.");
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
        await cargarIndices();
    } catch (error) {
        toast(error.message);
    }
}

function editarProducto(id) {
    const p = productos.find((x) => Number(x.id) === Number(id));
    if (!p) return;

    setValue("producto-id", p.id);
    setValue("nombre", p.nombre);
    setValue("categoria", p.categoria);
    setValue("precio", p.precio);
    setValue("precioAntes", p.precioAntes || "");
    setValue("stock", p.stock);
    setValue("imagen-producto-valor", p.imagen || "");
    setValue("descripcion", p.descripcion || "");
    setChecked("oferta", !!p.oferta);
    setChecked("destacado", !!p.destacado);
    setValue("producto-vendedor", p.vendedorId || "");
    setText("titulo-form", "Editar producto");

    const preview = document.getElementById("preview-producto");
    const img = document.getElementById("preview-producto-img");
    if (img) img.src = p.imagen || "img/logo.png";
    preview?.classList.remove("oculto");

    mostrarPanel("panel-productos");
}

async function eliminarProducto(id) {
    if (!(await FastMarket.confirmAction("¿Seguro que deseas eliminar este producto del catálogo?"))) return;
    try {
        await FastMarket.request(`/productos/${id}`, { method: "DELETE", auth: true });
        toast("Producto desactivado. Los pedidos antiguos se conservan.");
        await cargarProductos();
        await cargarIndices();
    } catch (error) {
        toast(error.message);
    }
}

function limpiarProducto() {
    document.getElementById("form-producto")?.reset();
    setValue("producto-id", "");
    setValue("imagen-producto-valor", "");
    setText("titulo-form", "Agregar producto");
    document.getElementById("preview-producto")?.classList.add("oculto");
}

/* BANNERS */

function activarBanners() {
    document.getElementById("form-banner")?.addEventListener("submit", guardarBanner);
    document.getElementById("btn-limpiar-banner")?.addEventListener("click", limpiarBanner);
    document.getElementById("banner-imagen")?.addEventListener("change", (e) => cargarImagen(e, "banner-imagen-valor", "preview-banner", "preview-banner-img"));
    document.getElementById("buscar-banner")?.addEventListener("input", pintarBanners);
    document.getElementById("lista-banners")?.addEventListener("click", async (e) => {
        const editar = e.target.closest("[data-editar-banner]");
        const eliminar = e.target.closest("[data-eliminar-banner]");
        if (editar) editarBanner(Number(editar.dataset.editarBanner));
        if (eliminar) await eliminarBanner(Number(eliminar.dataset.eliminarBanner));
    });
}

async function cargarBanners() {
    try {
        banners = await FastMarket.request("/banners");
        pintarBanners();
    } catch (error) {
        toast(error.message);
    }
}

function pintarBanners() {
    const contenedor = document.getElementById("lista-banners");
    if (!contenedor) return;

    const texto = document.getElementById("buscar-banner")?.value.toLowerCase().trim() || "";
    const lista = banners.filter((b) => `${b.titulo} ${b.descripcion}`.toLowerCase().includes(texto));

    contenedor.innerHTML = lista.length ? "" : `<div class="banner-card-admin"><h3>No hay banners.</h3></div>`;

    lista.forEach((b) => {
        const card = document.createElement("article");
        card.className = "banner-card-admin";
        card.innerHTML = `
            <img src="${FastMarket.escapeHTML(b.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(b.titulo)}" onerror="this.src='img/logo.png'">
            <div class="banner-card-info">
                <h3>${FastMarket.escapeHTML(b.titulo)}</h3>
                <p>${FastMarket.escapeHTML(b.descripcion || "")}</p>
                <span class="${b.activo ? "estado-banner-activo" : "estado-banner-inactivo"}">${b.activo ? "Activo" : "Inactivo"}</span>
                <div class="banner-card-acciones">
                    <button class="btn-editar-banner" data-editar-banner="${b.id}">Editar</button>
                    <button class="btn-eliminar-banner" data-eliminar-banner="${b.id}">Eliminar</button>
                </div>
            </div>`;
        contenedor.appendChild(card);
    });
}

async function guardarBanner(e) {
    e.preventDefault();

    const id = value("banner-id");
    const payload = {
        titulo: value("banner-titulo"),
        descripcion: value("banner-descripcion"),
        imagen: value("banner-imagen-valor") || "img/logo.png",
        activo: checked("banner-activo")
    };

    if (!payload.titulo || !payload.descripcion) {
        toast("Completa título y descripción del banner.");
        return;
    }

    try {
        await FastMarket.request(id ? `/banners/${id}` : "/banners", {
            method: id ? "PUT" : "POST",
            body: payload,
            auth: true
        });
        toast(id ? "Banner actualizado." : "Banner creado.");
        limpiarBanner();
        await cargarBanners();
    } catch (error) {
        toast(error.message);
    }
}

function editarBanner(id) {
    const b = banners.find((x) => Number(x.id) === Number(id));
    if (!b) return;

    setValue("banner-id", b.id);
    setValue("banner-titulo", b.titulo);
    setValue("banner-descripcion", b.descripcion || "");
    setValue("banner-imagen-valor", b.imagen || "");
    setChecked("banner-activo", !!b.activo);
    setText("titulo-form-banner", "Editar banner");

    const preview = document.getElementById("preview-banner");
    const img = document.getElementById("preview-banner-img");
    if (img) img.src = b.imagen || "img/logo.png";
    preview?.classList.remove("oculto");

    mostrarPanel("panel-banners");
}

async function eliminarBanner(id) {
    if (!(await FastMarket.confirmAction("¿Seguro que deseas eliminar este banner?"))) return;
    try {
        await FastMarket.request(`/banners/${id}`, { method: "DELETE", auth: true });
        toast("Banner eliminado.");
        await cargarBanners();
    } catch (error) {
        toast(error.message);
    }
}

function limpiarBanner() {
    document.getElementById("form-banner")?.reset();
    setValue("banner-id", "");
    setValue("banner-imagen-valor", "");
    setText("titulo-form-banner", "Agregar banner");
    document.getElementById("preview-banner")?.classList.add("oculto");
}

/* PEDIDOS */

function activarPedidos() {
    document.getElementById("filtro-vendedor-pedidos")?.addEventListener("change", async (e) => {
        filtroVendedorPedidos = e.target.value || "todos";
        adminPages.pedidos.page = 0;
        await cargarPedidos();
    });
    document.getElementById("tabla-pedidos")?.addEventListener("change", async (e) => {
        const select = e.target.closest("[data-estado-pedido]");
        if (!select) return;
        await actualizarEstadoPedido(Number(select.dataset.estadoPedido), select.value);
    });
    document.getElementById("tabla-pedidos")?.addEventListener("click", async (e) => {
        const historial = e.target.closest("[data-historial-pedido]");
        if (historial) await verHistorialPedido(Number(historial.dataset.historialPedido));
    });
    document.getElementById("pedidos-prev")?.addEventListener("click", async () => { if (adminPages.pedidos.page > 0) { adminPages.pedidos.page--; await cargarPedidos(); } });
    document.getElementById("pedidos-next")?.addEventListener("click", async () => { if (adminPages.pedidos.page + 1 < adminPages.pedidos.totalPages) { adminPages.pedidos.page++; await cargarPedidos(); } });
}

async function cargarPedidos() {
    try {
        if (filtroVendedorPedidos !== "todos") {
            pedidos = await FastMarket.request(`/pedidos/vendedor/${Number(filtroVendedorPedidos)}`, { auth: true });
            adminPages.pedidos.totalPages = 1;
            adminPages.pedidos.page = 0;
        } else {
            const page = await FastMarket.request(`/pedidos/page?page=${adminPages.pedidos.page}&size=${adminPages.pedidos.size}`, { auth: true });
            pedidos = Array.isArray(page?.content) ? page.content : [];
            adminPages.pedidos.totalPages = Math.max(1, Number(page?.totalPages || 1));
            adminPages.pedidos.page = Math.min(Number(page?.number || 0), adminPages.pedidos.totalPages - 1);
        }
        actualizarPaginacion("pedidos");
        actualizarTituloPedidos();
        pintarPedidos();
    } catch (error) {
        toast(error.message);
    }
}

function actualizarTituloPedidos() {
    const titulo = document.getElementById("titulo-pedidos-admin");
    const subtitulo = document.getElementById("subtitulo-pedidos-admin");
    if (!titulo || !subtitulo) return;
    if (filtroVendedorPedidos === "todos") {
        titulo.textContent = "Pedidos y ventas generales";
        subtitulo.textContent = "Vista administrativa completa de pedidos registrados.";
        return;
    }
    const vendedor = vendedores.find((v) => Number(v.id) === Number(filtroVendedorPedidos));
    titulo.textContent = `Pedidos de ${vendedor?.nombre || "vendedor"}`;
    subtitulo.textContent = "Vista filtrada: pedidos que contienen productos de este vendedor.";
}

function pintarPedidos() {
    const tbody = document.getElementById("tabla-pedidos");
    if (!tbody) return;

    tbody.innerHTML = pedidos.length ? "" : `<tr><td colspan="8">No hay pedidos registrados.</td></tr>`;

    pedidos.forEach((p) => {
        const productosTexto = (p.items || []).map((i) => `${i.productoNombre} x${i.cantidad}`).join(", ");
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${FastMarket.escapeHTML(p.codigo)}</strong><br><small>${fecha(p.fecha)}</small></td>
            <td>${FastMarket.escapeHTML(p.usuarioNombre || "")}</td>
            <td>${FastMarket.escapeHTML(productosTexto)}</td>
            <td>${FastMarket.money(p.total)}</td>
            <td>${p.descuento ? FastMarket.money(p.descuento) : "-"}${p.cuponCodigo ? `<br><small>${FastMarket.escapeHTML(p.cuponCodigo)}</small>` : ""}</td>
            <td>${FastMarket.estadoTexto(p.estado)}</td>
            <td>
                <select data-estado-pedido="${p.id}">
                    ${["PENDIENTE","CONFIRMADO","PREPARANDO","CAMINO","ENTREGADO","CANCELADO"].map((estado) => `<option value="${estado}" ${FastMarket.normalizarEstado(p.estado) === estado ? "selected" : ""}>${FastMarket.estadoTexto(estado)}</option>`).join("")}
                </select>
            </td>
            <td><button type="button" class="btn-secundario" data-historial-pedido="${p.id}">Ver</button></td>`;
        tbody.appendChild(tr);
    });
}

async function actualizarEstadoPedido(id, estado) {
    try {
        await FastMarket.request(`/pedidos/${id}/estado?estado=${estado}`, {
            method: "PUT",
            auth: true
        });
        toast("Estado del pedido actualizado.");
        await cargarPedidos();
    } catch (error) {
        toast(error.message);
    }
}

async function verHistorialPedido(id) {
    const panel = document.getElementById("historial-pedido-panel");
    if (!panel) return;
    try {
        const historial = await FastMarket.request(`/pedidos/${id}/historial`, { auth: true });
        panel.classList.remove("oculto");
        panel.innerHTML = `<h3>Historial del pedido</h3>${pintarListaHistorial(historial, "pedido")}`;
    } catch (error) {
        toast(error.message);
    }
}

function pintarListaHistorial(items, tipo) {
    if (!items || !items.length) return `<p>No hay historial registrado.</p>`;
    const lis = items.map((h) => {
        if (tipo === "pedido") {
            return `<li><strong>${fecha(h.fecha)}</strong> — ${FastMarket.estadoTexto(h.estadoAnterior || "CREADO")} → ${FastMarket.estadoTexto(h.estadoNuevo)} por ${FastMarket.escapeHTML(h.actorNombre || "Sistema")}<br><small>${FastMarket.escapeHTML(h.motivo || "")}</small></li>`;
        }
        return `<li><strong>${fecha(h.fecha)}</strong> — ${FastMarket.escapeHTML(h.usuarioNombre || "Cliente")} usó ${FastMarket.escapeHTML(h.codigo || "")} en ${FastMarket.escapeHTML(h.pedidoCodigo || "pedido")} y ahorró ${FastMarket.money(h.descuentoAplicado)}</li>`;
    }).join("");
    return `<ul>${lis}</ul>`;
}
/* USUARIOS / ÍNDICES */

function activarUsuarios() {
    document.getElementById("form-usuario-admin")?.addEventListener("submit", guardarUsuarioAdmin);
    document.getElementById("btn-limpiar-usuario")?.addEventListener("click", limpiarUsuarioAdmin);
    document.getElementById("buscar-usuario")?.addEventListener("input", pintarUsuarios);
    document.getElementById("filtro-rol-usuario")?.addEventListener("change", pintarUsuarios);
    document.getElementById("tabla-usuarios")?.addEventListener("click", (e) => {
        const editar = e.target.closest("[data-editar-usuario]");
        if (editar) editarUsuarioAdmin(Number(editar.dataset.editarUsuario));
    });
}

async function cargarUsuarios() {
    if (usuarioActual?.rol !== "ADMIN") { usuarios = []; pintarUsuarios(); return; }
    try {
        usuarios = await FastMarket.request("/usuarios", { auth: true });
        pintarUsuarios();
    } catch (error) {
        toast(error.message);
    }
}

function pintarUsuarios() {
    const tbody = document.getElementById("tabla-usuarios");
    if (!tbody) return;

    const texto = document.getElementById("buscar-usuario")?.value.toLowerCase().trim() || "";
    const rol = document.getElementById("filtro-rol-usuario")?.value || "todos";

    const lista = usuarios.filter((u) => {
        const coincideTexto = `${u.nombre} ${u.correo} ${u.rol} ${u.estado}`.toLowerCase().includes(texto);
        const coincideRol = rol === "todos" || u.rol === rol;
        return coincideTexto && coincideRol;
    });

    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="6">No hay usuarios.</td></tr>`;

    lista.forEach((u) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${FastMarket.escapeHTML(u.nombre || "")}</td>
            <td>${FastMarket.escapeHTML(u.correo || "")}</td>
            <td><span class="${u.rol === "ADMIN" ? "estado-oferta" : u.rol === "VENDEDOR" ? "estado-activo" : "estado-normal"}">${u.rol === "ADMIN" ? "Administrador" : u.rol === "VENDEDOR" ? "Vendedor" : "Cliente"}</span></td>
            <td><span class="${u.estado === "ACTIVO" ? "estado-activo" : "estado-inactivo"}">${FastMarket.escapeHTML(u.estado || "")}</span></td>
            <td>${FastMarket.escapeHTML(u.telefono || "No registrado")}</td>
            <td><button class="btn-editar" data-editar-usuario="${u.id}">Editar</button></td>`;
        tbody.appendChild(tr);
    });
}

async function guardarUsuarioAdmin(e) {
    e.preventDefault();

    const id = value("usuario-admin-id");
    const password = value("usuario-password");
    const payload = {
        nombre: value("usuario-nombre"),
        telefono: value("usuario-telefono"),
        documento: value("usuario-documento"),
        rol: value("usuario-rol") || "CLIENTE",
        estado: value("usuario-estado") || "ACTIVO"
    };

    if (!payload.nombre) {
        toast("Ingresa el nombre del usuario.");
        return;
    }

    if (id) {
        if (password) payload.passwordNueva = password;
    } else {
        payload.correo = value("usuario-correo").toLowerCase();
        payload.password = password;
        if (!payload.correo || !payload.correo.includes("@")) {
            toast("Ingresa un correo válido.");
            return;
        }
        if (!payload.password || payload.password.length < 6) {
            toast("La contraseña debe tener mínimo 6 caracteres.");
            return;
        }
    }

    try {
        await FastMarket.request(id ? `/usuarios/${id}/gestion` : "/usuarios", {
            method: id ? "PUT" : "POST",
            body: payload,
            auth: true
        });
        toast(id ? "Usuario actualizado." : "Usuario creado.");
        limpiarUsuarioAdmin();
        await cargarUsuarios();
    } catch (error) {
        toast(error.message);
    }
}

function editarUsuarioAdmin(id) {
    const usuario = usuarios.find((u) => Number(u.id) === Number(id));
    if (!usuario) return;

    setValue("usuario-admin-id", usuario.id);
    setValue("usuario-nombre", usuario.nombre || "");
    setValue("usuario-correo", usuario.correo || "");
    setValue("usuario-password", "");
    setValue("usuario-telefono", usuario.telefono || "");
    setValue("usuario-documento", usuario.documento || "");
    setValue("usuario-rol", usuario.rol || "CLIENTE");
    setValue("usuario-estado", usuario.estado || "ACTIVO");
    setText("titulo-form-usuario", "Editar usuario");

    const correo = document.getElementById("usuario-correo");
    if (correo) correo.disabled = true;

    mostrarPanel("panel-usuarios");
}


async function cargarVendedores() {
    if (usuarioActual?.rol !== "ADMIN") {
        vendedores = usuarioActual?.rol === "VENDEDOR" ? [usuarioActual] : [];
        llenarSelectVendedores();
        return;
    }
    try {
        vendedores = await FastMarket.request("/admin/vendedores", { auth: true });
        llenarSelectVendedores();
        pintarVendedoresAdmin();
    } catch (error) {
        vendedores = usuarios.filter((u) => u.rol === "VENDEDOR");
        llenarSelectVendedores();
    }
}

function llenarSelectVendedores() {
    const filtroProductos = document.getElementById("filtro-vendedor-productos");
    if (filtroProductos) {
        const actual = filtroProductos.value || filtroVendedorProductos;
        filtroProductos.innerHTML = `<option value="todos">Todos los productos</option><option value="general">Solo productos generales</option>` + vendedores.map((v) => `<option value="${v.id}">${FastMarket.escapeHTML(v.nombre)} - ${FastMarket.escapeHTML(v.correo || "")}</option>`).join("");
        filtroProductos.value = actual || "todos";
    }
    const filtroPedidos = document.getElementById("filtro-vendedor-pedidos");
    if (filtroPedidos) {
        const actual = filtroPedidos.value || filtroVendedorPedidos;
        filtroPedidos.innerHTML = `<option value="todos">Todos los pedidos</option>` + vendedores.map((v) => `<option value="${v.id}">${FastMarket.escapeHTML(v.nombre)} - ${FastMarket.escapeHTML(v.correo || "")}</option>`).join("");
        filtroPedidos.value = actual || "todos";
    }
    const selects = [document.getElementById("producto-vendedor"), document.getElementById("cupon-vendedor")].filter(Boolean);
    selects.forEach((select) => {
        const actual = select.value;
        const primera = select.id === "producto-vendedor" ? `<option value="">Producto general de tienda</option>` : `<option value="">Seleccionar vendedor</option>`;
        select.innerHTML = primera + vendedores.map((v) => `<option value="${v.id}">${FastMarket.escapeHTML(v.nombre)} - ${FastMarket.escapeHTML(v.correo || "")}</option>`).join("");
        select.value = actual;
    });
}

function pintarVendedoresAdmin() {
    const cont = document.getElementById("lista-vendedores-admin");
    if (!cont) return;
    const lista = vendedores.length ? vendedores : usuarios.filter((u) => u.rol === "VENDEDOR");
    cont.innerHTML = lista.length ? "" : `<div class="banner-card-admin"><h3>No hay vendedores registrados.</h3><p>Crea un usuario con rol VENDEDOR desde Usuarios y administradores.</p></div>`;
    lista.forEach((v) => {
        const prods = productos.filter((p) => Number(p.vendedorId) === Number(v.id));
        const pedidosVend = pedidos.filter((p) => (p.items || []).some((i) => prods.some((prod) => prod.id === i.productoId)));
        const card = document.createElement("article");
        card.className = "vendedor-card-admin";
        const nombresProductos = prods.slice(0, 4).map((p) => `• ${FastMarket.escapeHTML(p.nombre)}`).join("<br>") || "Sin productos registrados";
        const codigosPedidos = pedidosVend.slice(0, 4).map((p) => `• ${FastMarket.escapeHTML(p.codigo)} - ${FastMarket.money(p.total)}`).join("<br>") || "Sin pedidos registrados";
        card.innerHTML = `
            <h3>${FastMarket.escapeHTML(v.nombre)}</h3>
            <p>${FastMarket.escapeHTML(v.correo || "")}</p>
            <div class="vendedor-metricas">
                <span>📦 ${prods.length} productos</span>
                <span>🧾 ${pedidosVend.length} pedidos</span>
                <span>📞 ${FastMarket.escapeHTML(v.telefono || "Sin teléfono")}</span>
            </div>
            <div class="vendedor-detalle-card">
                <strong>Productos</strong><br>${nombresProductos}
                <br><br><strong>Pedidos</strong><br>${codigosPedidos}
            </div>
            <div class="banner-card-acciones">
                <button class="btn-editar" data-ver-productos-vendedor="${v.id}">Ver solo sus productos</button>
                <button class="btn-editar" data-ver-pedidos-vendedor="${v.id}">Ver solo sus pedidos</button>
            </div>`;
        cont.appendChild(card);
    });
}

function configurarPermisosPanel() {
    const esVendedor = usuarioActual?.rol === "VENDEDOR";
    document.querySelectorAll(".solo-admin").forEach((el) => el.classList.toggle("oculto", esVendedor));
    const grupoVendedorProducto = document.getElementById("grupo-vendedor-producto");
    if (grupoVendedorProducto) grupoVendedorProducto.classList.toggle("oculto", esVendedor);
    const tipoCupon = document.getElementById("cupon-tipo");
    if (tipoCupon && esVendedor) {
        tipoCupon.value = "VENDEDOR";
        tipoCupon.disabled = true;
        document.getElementById("grupo-cupon-vendedor")?.classList.add("oculto");
    }
}

/* CUPONES */

function activarCupones() {
    document.getElementById("form-cupon")?.addEventListener("submit", guardarCupon);
    document.getElementById("btn-limpiar-cupon")?.addEventListener("click", limpiarCupon);
    document.getElementById("buscar-cupon")?.addEventListener("input", pintarCupones);
    document.getElementById("cupon-tipo")?.addEventListener("change", actualizarVisibilidadCuponVendedor);
    document.getElementById("tabla-cupones")?.addEventListener("click", async (e) => {
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
    } catch (error) {
        cupones = [];
    }
}

function pintarCupones() {
    const tbody = document.getElementById("tabla-cupones");
    if (!tbody) return;
    const texto = document.getElementById("buscar-cupon")?.value.toLowerCase().trim() || "";
    const lista = cupones.filter((c) => `${c.codigo} ${c.descripcion} ${c.tipo} ${c.vendedorNombre || ""}`.toLowerCase().includes(texto));
    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="7">No hay cupones.</td></tr>`;
    lista.forEach((c) => {
        const descuento = `${Number(c.porcentaje || 0) > 0 ? `${c.porcentaje}%` : ""}${Number(c.montoFijo || 0) > 0 ? ` S/ ${Number(c.montoFijo).toFixed(2)}` : ""}`.trim();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${FastMarket.escapeHTML(c.codigo)}</strong><br><small>${FastMarket.escapeHTML(c.descripcion || "")}</small></td>
            <td>${descripcionTipoCupon(c)}</td>
            <td>${descuento || "-"}<br><small>Mín: ${FastMarket.money(c.montoMinimo || 0)}</small></td>
            <td>${vigenciaCupon(c)}</td>
            <td>${c.usosActuales || 0}${c.usosMaximos ? `/${c.usosMaximos}` : ""}</td>
            <td><span class="${c.activo ? "estado-activo" : "estado-inactivo"}">${c.activo ? "Activo" : "Inactivo"}</span></td>
            <td><button class="btn-editar" data-editar-cupon="${c.id}">Editar</button><button class="btn-secundario" data-usos-cupon="${c.id}">Usos</button><button class="btn-eliminar" data-eliminar-cupon="${c.id}">Eliminar</button></td>`;
        tbody.appendChild(tr);
    });
}


function vigenciaCupon(c) {
    const inicio = c.fechaInicio ? fecha(c.fechaInicio) : "Ahora";
    const fin = c.fechaFin ? fecha(c.fechaFin) : "30 días por defecto";
    return `<small>${FastMarket.escapeHTML(inicio)}<br>hasta ${FastMarket.escapeHTML(fin)}</small>`;
}

function toDatetimeLocal(valor) {
    if (!valor) return "";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function descripcionTipoCupon(c) {
    if (c.tipo === "VENDEDOR") return `Vendedor<br><small>${FastMarket.escapeHTML(c.vendedorNombre || "")}</small>`;
    if (c.tipo === "CATEGORIA") return `Categoría<br><small>${FastMarket.escapeHTML(c.categoriaObjetivo || "")}</small>`;
    if (c.tipo === "PRODUCTO") return `Producto<br><small>${FastMarket.escapeHTML(c.productoObjetivoNombre || "")}</small>`;
    return "Global";
}

function actualizarVisibilidadCuponVendedor() {
    const tipo = value("cupon-tipo");
    document.getElementById("grupo-cupon-vendedor")?.classList.toggle("oculto", tipo !== "VENDEDOR" || usuarioActual?.rol === "VENDEDOR");
    document.getElementById("grupo-cupon-categoria")?.classList.toggle("oculto", tipo !== "CATEGORIA");
    document.getElementById("grupo-cupon-producto")?.classList.toggle("oculto", tipo !== "PRODUCTO");
}

function poblarSelectProductosCupon() {
    const select = document.getElementById("cupon-producto");
    if (!select) return;
    const actual = select.value;
    select.innerHTML = `<option value="">Seleccionar producto</option>` + productos.map((p) => `<option value="${p.id}">${FastMarket.escapeHTML(p.nombre || "Producto")}</option>`).join("");
    if (actual) select.value = actual;
}


async function guardarCupon(e) {
    e.preventDefault();
    const id = value("cupon-id");
    const payload = {
        codigo: value("cupon-codigo"),
        descripcion: value("cupon-descripcion"),
        tipo: usuarioActual?.rol === "VENDEDOR" ? "VENDEDOR" : value("cupon-tipo"),
        vendedorId: value("cupon-vendedor") ? Number(value("cupon-vendedor")) : null,
        categoriaObjetivo: value("cupon-categoria") || null,
        productoObjetivoId: value("cupon-producto") ? Number(value("cupon-producto")) : null,
        porcentaje: Number(value("cupon-porcentaje") || 0),
        montoFijo: Number(value("cupon-monto") || 0),
        montoMinimo: Number(value("cupon-minimo") || 0),
        usosMaximos: value("cupon-usos") ? Number(value("cupon-usos")) : null,
        fechaInicio: value("cupon-inicio") || null,
        fechaFin: value("cupon-fin") || null,
        activo: checked("cupon-activo")
    };
    if (!payload.codigo) return toast("Ingresa el código del cupón.");
    if (payload.porcentaje <= 0 && payload.montoFijo <= 0) return toast("Ingresa porcentaje o monto fijo de descuento.");
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
    setValue("cupon-id", c.id);
    setValue("cupon-codigo", c.codigo || "");
    setValue("cupon-descripcion", c.descripcion || "");
    setValue("cupon-tipo", c.tipo || "GLOBAL");
    setValue("cupon-vendedor", c.vendedorId || "");
    setValue("cupon-categoria", c.categoriaObjetivo || "moda");
    setValue("cupon-producto", c.productoObjetivoId || "");
    setValue("cupon-porcentaje", c.porcentaje || "");
    setValue("cupon-monto", c.montoFijo || "");
    setValue("cupon-minimo", c.montoMinimo || "");
    setValue("cupon-usos", c.usosMaximos || "");
    setValue("cupon-inicio", toDatetimeLocal(c.fechaInicio));
    setValue("cupon-fin", toDatetimeLocal(c.fechaFin));
    setChecked("cupon-activo", !!c.activo);
    setText("titulo-form-cupon", "Editar cupón");
    actualizarVisibilidadCuponVendedor();
    mostrarPanel("panel-cupones");
}

async function verUsosCupon(id) {
    const panel = document.getElementById("historial-cupon-panel");
    if (!panel) return;
    try {
        const usos = await FastMarket.request(`/cupones/${id}/usos`, { auth: true });
        panel.classList.remove("oculto");
        panel.innerHTML = `<h3>Historial de usos del cupón</h3>${pintarListaHistorial(usos, "cupon")}`;
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
    document.getElementById("form-cupon")?.reset();
    setValue("cupon-id", "");
    setValue("cupon-tipo", usuarioActual?.rol === "VENDEDOR" ? "VENDEDOR" : "GLOBAL");
    setValue("cupon-inicio", "");
    setValue("cupon-fin", "");
    setChecked("cupon-activo", true);
    setText("titulo-form-cupon", "Agregar cupón");
    actualizarVisibilidadCuponVendedor();
}

function limpiarUsuarioAdmin() {
    document.getElementById("form-usuario-admin")?.reset();
    setValue("usuario-admin-id", "");
    setValue("usuario-rol", "CLIENTE");
    setValue("usuario-estado", "ACTIVO");
    setText("titulo-form-usuario", "Agregar usuario");

    const correo = document.getElementById("usuario-correo");
    if (correo) correo.disabled = false;
}

async function cargarIndices() {
    try {
        const i = await FastMarket.request("/admin/indices", { auth: true });
        setText("total-productos", i.totalProductos);
        setText("total-ofertas", i.totalOfertas);
        setText("total-stock", i.totalStock);
        setText("total-pedidos", i.totalPedidos);
        setText("total-vendedores", i.totalVendedores ?? vendedores.length);
    } catch {
        setText("total-productos", productos.length);
        setText("total-ofertas", productos.filter((p) => p.oferta).length);
        setText("total-stock", productos.reduce((s, p) => s + Number(p.stock || 0), 0));
        setText("total-pedidos", pedidos.length);
    }
}

/* CONTENIDO INDEX */

function activarIndex() {
    document.getElementById("form-index")?.addEventListener("submit", guardarIndex);
    document.getElementById("btn-limpiar-index")?.addEventListener("click", limpiarIndex);
    document.getElementById("buscar-index")?.addEventListener("input", pintarIndex);
    document.getElementById("tabla-index")?.addEventListener("click", async (e) => {
        const editar = e.target.closest("[data-editar-index]");
        const eliminar = e.target.closest("[data-eliminar-index]");
        if (editar) editarIndex(Number(editar.dataset.editarIndex));
        if (eliminar) await eliminarIndex(Number(eliminar.dataset.eliminarIndex));
    });
}

async function cargarIndexContenidos() {
    try {
        const contenidos = await FastMarket.request("/index-contenido");
        indexContenidos = contenidos.filter((c) => TIPOS_INDEX_PERMITIDOS.includes(c.tipo));
        pintarIndex();
    } catch (error) {
        toast(error.message);
    }
}

function pintarIndex() {
    const tbody = document.getElementById("tabla-index");
    if (!tbody) return;

    const texto = document.getElementById("buscar-index")?.value.toLowerCase().trim() || "";
    const lista = indexContenidos.filter((c) => TIPOS_INDEX_PERMITIDOS.includes(c.tipo) && `${c.tipo} ${c.clave} ${c.titulo} ${c.descripcion}`.toLowerCase().includes(texto));

    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="5">No hay contenido.</td></tr>`;

    lista.forEach((c) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><span class="estado-oferta">${formatearTipoIndex(c.tipo)}</span></td>
            <td>${FastMarket.escapeHTML(c.clave)}</td>
            <td><strong>${FastMarket.escapeHTML(c.titulo)}</strong><br><small>${FastMarket.escapeHTML(c.descripcion || "")}</small></td>
            <td><span class="${c.activo ? "estado-activo" : "estado-inactivo"}">${c.activo ? "Activo" : "Inactivo"}</span></td>
            <td>
                <button class="btn-editar" data-editar-index="${c.id}">Editar</button>
                <button class="btn-eliminar" data-eliminar-index="${c.id}">Eliminar</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

async function guardarIndex(e) {
    e.preventDefault();

    const id = value("index-id");
    const payload = {
        tipo: value("index-tipo"),
        clave: value("index-clave"),
        titulo: value("index-titulo"),
        descripcion: value("index-descripcion"),
        imagen: value("index-imagen"),
        enlace: value("index-enlace"),
        orden: Number(value("index-orden") || 1),
        activo: checked("index-activo")
    };

    if (!TIPOS_INDEX_PERMITIDOS.includes(payload.tipo)) {
        toast("Solo puedes editar Destacados, Promociones, Opiniones y Ayuda.");
        return;
    }

    if (!payload.tipo || !payload.clave || !payload.titulo) {
        toast("Completa sección, clave y título.");
        return;
    }

    try {
        await FastMarket.request(id ? `/index-contenido/${id}` : "/index-contenido", {
            method: id ? "PUT" : "POST",
            body: payload,
            auth: true
        });
        toast(id ? "Contenido actualizado." : "Contenido creado.");
        limpiarIndex();
        await cargarIndexContenidos();
    } catch (error) {
        toast(error.message);
    }
}

function editarIndex(id) {
    const c = indexContenidos.find((x) => Number(x.id) === Number(id));
    if (!c) return;

    setValue("index-id", c.id);
    setValue("index-tipo", c.tipo);
    setValue("index-clave", c.clave);
    setValue("index-titulo", c.titulo);
    setValue("index-descripcion", c.descripcion || "");
    setValue("index-imagen", c.imagen || "");
    setValue("index-enlace", c.enlace || "");
    setValue("index-orden", c.orden || 1);
    setChecked("index-activo", !!c.activo);
    setText("titulo-form-index", "Editar contenido");
    mostrarPanel("panel-index");
}

async function eliminarIndex(id) {
    if (!(await FastMarket.confirmAction("¿Seguro que deseas eliminar este contenido?"))) return;
    try {
        await FastMarket.request(`/index-contenido/${id}`, { method: "DELETE", auth: true });
        toast("Contenido eliminado.");
        await cargarIndexContenidos();
    } catch (error) {
        toast(error.message);
    }
}

function limpiarIndex() {
    document.getElementById("form-index")?.reset();
    setValue("index-id", "");
    setValue("index-tipo", "destacado");
    setChecked("index-activo", true);
    setText("titulo-form-index", "Agregar contenido");
}

/* POWER BI */

function activarPowerBI() {
    document.getElementById("btn-guardar-powerbi")?.addEventListener("click", guardarPowerBI);
    document.getElementById("btn-limpiar-powerbi")?.addEventListener("click", limpiarPowerBI);
}

async function guardarPowerBI() {
    const entrada = value("powerbi-url");
    const url = extraerUrlPowerBI(entrada);
    if (!url || !url.startsWith("http")) {
        toast("Pega un enlace o iframe válido.");
        return;
    }

    try {
        await FastMarket.request("/config/powerbi", { method: "PUT", auth: true, body: { valor: url } });
        mostrarPowerBI(url);
        toast("Reporte guardado en la base de datos.");
    } catch (error) {
        toast(error.message);
    }
}

async function cargarPowerBI() {
    try {
        const config = await FastMarket.request("/config/powerbi", { auth: true });
        const url = config?.valor || "";
        if (url) {
            setValue("powerbi-url", url);
            mostrarPowerBI(url);
        }
    } catch (error) {
        toast(error.message);
    }
}

function mostrarPowerBI(url) {
    const cont = document.getElementById("powerbi-reporte");
    if (!cont) return;
    cont.classList.remove("powerbi-placeholder");
    cont.innerHTML = `<iframe src="${FastMarket.escapeHTML(url)}" allowfullscreen="true"></iframe>`;
}

async function limpiarPowerBI() {
    if (!(await FastMarket.confirmAction("¿Seguro que deseas eliminar el reporte Power BI guardado?"))) return;

    try {
        await FastMarket.request("/config/powerbi", { method: "DELETE", auth: true });
        setValue("powerbi-url", "");
        const cont = document.getElementById("powerbi-reporte");
        if (cont) {
            cont.classList.add("powerbi-placeholder");
            cont.innerHTML = `<p>Espacio para reporte Power BI</p><small>Cuando pegues el enlace, el reporte aparecerá aquí.</small>`;
        }
        toast("Reporte eliminado de la base de datos.");
    } catch (error) {
        toast(error.message);
    }
}

function extraerUrlPowerBI(texto) {
    if (!texto) return "";
    const match = texto.match(/src=["']([^"']+)["']/);
    return match ? match[1] : texto.trim();
}

/* UTILIDADES */

function cargarImagen(e, inputId, previewId, imgId) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
        toast("Selecciona una imagen válida.");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        setValue(inputId, reader.result);
        const img = document.getElementById(imgId);
        if (img) img.src = reader.result;
        document.getElementById(previewId)?.classList.remove("oculto");
    };
    reader.readAsDataURL(archivo);
}

function value(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
}

function checked(id) {
    return !!document.getElementById(id)?.checked;
}

function setChecked(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "";
}

function toast(mensaje) {
    const el = document.getElementById("toast");
    if (!el) {
        if (FastMarket.notify) FastMarket.notify(mensaje);
        return;
    }
    el.textContent = mensaje;
    el.classList.add("activo");
    setTimeout(() => el.classList.remove("activo"), 2800);
}


function stockBadge(stock) {
    const n = Number(stock || 0);
    if (n <= 0) return `<span class="estado-stock estado-stock-agotado">Agotado</span>`;
    if (n <= 5) return `<span class="estado-stock estado-stock-bajo">Stock bajo · ${n}</span>`;
    return `<span class="estado-stock estado-stock-ok">${n} unidades</span>`;
}

function formatearTipoIndex(tipo) {
    const nombres = {
        destacado: "Destacados",
        promocion: "Promociones",
        opinion: "Opiniones",
        ayuda: "Ayuda"
    };
    return nombres[tipo] || tipo;
}

function formatearCategoria(valor) {
    const map = {
        moda: "Moda",
        tecnologia: "Tecnología",
        hogar: "Hogar",
        accesorios: "Accesorios",
        estudio: "Estudio"
    };
    return map[valor] || valor || "";
}

function actualizarPaginacion(tipo) {
    const estado = adminPages[tipo];
    const info = document.getElementById(`${tipo}-page-info`);
    const prev = document.getElementById(`${tipo}-prev`);
    const next = document.getElementById(`${tipo}-next`);
    if (info) info.textContent = `Página ${estado.page + 1} de ${estado.totalPages}`;
    if (prev) prev.disabled = estado.page <= 0;
    if (next) next.disabled = estado.page + 1 >= estado.totalPages;
}

function fecha(valor) {
    if (!valor) return "";
    return new Date(valor).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}
