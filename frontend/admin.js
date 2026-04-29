let productos = [];
let banners = [];
let pedidos = [];
let usuarios = [];
let indexContenidos = [];

document.addEventListener("DOMContentLoaded", async () => {
    const admin = FastMarket.requireAdmin(false);
    if (!admin) {
        alert("Debes iniciar sesión como administrador.");
        window.location.href = "login.html";
        return;
    }

    setText("nombre-admin", admin.nombre || "Administrador");
    activarMenu();
    activarPaneles();
    activarProductos();
    activarBanners();
    activarPedidos();
    activarUsuarios();
    activarIndex();
    activarPowerBI();

    await cargarTodo();
});

async function cargarTodo() {
    await Promise.allSettled([
        cargarProductos(),
        cargarBanners(),
        cargarPedidos(),
        cargarUsuarios(),
        cargarIndices(),
        cargarIndexContenidos()
    ]);
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
    document.querySelectorAll("[data-panel]").forEach((btn) => {
        btn.addEventListener("click", () => mostrarPanel(btn.dataset.panel));
    });
}

function mostrarPanel(id) {
    document.querySelectorAll(".panel-admin").forEach((panel) => panel.classList.remove("activo"));
    document.getElementById(id)?.classList.add("activo");
    document.getElementById("opciones-admin")?.classList.remove("activo");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* PRODUCTOS */

function activarProductos() {
    document.getElementById("form-producto")?.addEventListener("submit", guardarProducto);
    document.getElementById("btn-limpiar")?.addEventListener("click", limpiarProducto);
    document.getElementById("imagen-producto")?.addEventListener("change", (e) => cargarImagen(e, "imagen-producto-valor", "preview-producto", "preview-producto-img"));
    document.getElementById("buscar-admin")?.addEventListener("input", pintarProductos);
    document.getElementById("filtro-categoria")?.addEventListener("change", pintarProductos);
    document.getElementById("tabla-productos")?.addEventListener("click", async (e) => {
        const editar = e.target.closest("[data-editar-producto]");
        const eliminar = e.target.closest("[data-eliminar-producto]");
        if (editar) editarProducto(Number(editar.dataset.editarProducto));
        if (eliminar) await eliminarProducto(Number(eliminar.dataset.eliminarProducto));
    });
}

async function cargarProductos() {
    try {
        productos = await FastMarket.request("/productos?incluirInactivos=true", { auth: true });
        productos = productos.filter((p) => p.activo !== false);
        pintarProductos();
    } catch (error) {
        toast(error.message);
    }
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

    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="7">No hay productos.</td></tr>`;

    lista.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${FastMarket.escapeHTML(p.imagen || "img/logo.png")}" class="img-tabla" alt="${FastMarket.escapeHTML(p.nombre)}" onerror="this.src='img/logo.png'"></td>
            <td><strong>${FastMarket.escapeHTML(p.nombre)}</strong><br><small>${FastMarket.escapeHTML(p.descripcion || "")}</small></td>
            <td>${formatearCategoria(p.categoria)}</td>
            <td><strong>${FastMarket.money(p.precio)}</strong>${p.precioAntes ? `<br><small>Antes: ${FastMarket.money(p.precioAntes)}</small>` : ""}</td>
            <td>${p.stock}</td>
            <td>
                <span class="${p.oferta ? "estado-oferta" : "estado-normal"}">${p.oferta ? "Oferta" : "Normal"}</span>
                ${p.destacado ? `<br><small>Destacado</small>` : ""}
            </td>
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
        destacado: checked("destacado")
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
    setText("titulo-form", "Editar producto");

    const preview = document.getElementById("preview-producto");
    const img = document.getElementById("preview-producto-img");
    if (img) img.src = p.imagen || "img/logo.png";
    preview?.classList.remove("oculto");

    mostrarPanel("panel-productos");
}

async function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto del catálogo?")) return;
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
    if (!confirm("¿Seguro que deseas eliminar este banner?")) return;
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
    document.getElementById("tabla-pedidos")?.addEventListener("change", async (e) => {
        const select = e.target.closest("[data-estado-pedido]");
        if (!select) return;
        await actualizarEstadoPedido(Number(select.dataset.estadoPedido), select.value);
    });
}

async function cargarPedidos() {
    try {
        pedidos = await FastMarket.request("/pedidos", { auth: true });
        pintarPedidos();
    } catch (error) {
        toast(error.message);
    }
}

function pintarPedidos() {
    const tbody = document.getElementById("tabla-pedidos");
    if (!tbody) return;

    tbody.innerHTML = pedidos.length ? "" : `<tr><td colspan="6">No hay pedidos registrados.</td></tr>`;

    pedidos.forEach((p) => {
        const productosTexto = (p.items || []).map((i) => `${i.productoNombre} x${i.cantidad}`).join(", ");
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${FastMarket.escapeHTML(p.codigo)}</strong><br><small>${fecha(p.fecha)}</small></td>
            <td>${FastMarket.escapeHTML(p.usuarioNombre || "")}</td>
            <td>${FastMarket.escapeHTML(productosTexto)}</td>
            <td>${FastMarket.money(p.total)}</td>
            <td>${FastMarket.estadoTexto(p.estado)}</td>
            <td>
                <select data-estado-pedido="${p.id}">
                    ${["PENDIENTE","CONFIRMADO","PREPARANDO","CAMINO","ENTREGADO","CANCELADO"].map((estado) => `<option value="${estado}" ${FastMarket.normalizarEstado(p.estado) === estado ? "selected" : ""}>${FastMarket.estadoTexto(estado)}</option>`).join("")}
                </select>
            </td>`;
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
            <td><span class="${u.rol === "ADMIN" ? "estado-oferta" : "estado-normal"}">${u.rol === "ADMIN" ? "Administrador" : "Cliente"}</span></td>
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
        indexContenidos = await FastMarket.request("/index-contenido");
        pintarIndex();
    } catch (error) {
        toast(error.message);
    }
}

function pintarIndex() {
    const tbody = document.getElementById("tabla-index");
    if (!tbody) return;

    const texto = document.getElementById("buscar-index")?.value.toLowerCase().trim() || "";
    const lista = indexContenidos.filter((c) => `${c.tipo} ${c.clave} ${c.titulo} ${c.descripcion}`.toLowerCase().includes(texto));

    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="5">No hay contenido.</td></tr>`;

    lista.forEach((c) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${FastMarket.escapeHTML(c.tipo)}</td>
            <td>${FastMarket.escapeHTML(c.clave)}</td>
            <td><strong>${FastMarket.escapeHTML(c.titulo)}</strong><br><small>${FastMarket.escapeHTML(c.descripcion || "")}</small></td>
            <td>${c.activo ? "Activo" : "Inactivo"}</td>
            <td>
                <button data-editar-index="${c.id}">Editar</button>
                <button data-eliminar-index="${c.id}">Eliminar</button>
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

    if (!payload.tipo || !payload.clave || !payload.titulo) {
        toast("Completa tipo, clave y título.");
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
    if (!confirm("¿Seguro que deseas eliminar este contenido?")) return;
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
    setChecked("index-activo", true);
    setText("titulo-form-index", "Agregar contenido");
}

/* POWER BI */

function activarPowerBI() {
    document.getElementById("btn-guardar-powerbi")?.addEventListener("click", guardarPowerBI);
    document.getElementById("btn-limpiar-powerbi")?.addEventListener("click", limpiarPowerBI);
}

function guardarPowerBI() {
    const entrada = value("powerbi-url");
    const url = extraerUrlPowerBI(entrada);
    if (!url || !url.startsWith("http")) {
        toast("Pega un enlace o iframe válido.");
        return;
    }
    localStorage.setItem("fastmarket_powerbi", url);
    mostrarPowerBI(url);
    toast("Reporte guardado.");
}

function cargarPowerBI() {
    const url = localStorage.getItem("fastmarket_powerbi");
    if (url) {
        setValue("powerbi-url", url);
        mostrarPowerBI(url);
    }
}

function mostrarPowerBI(url) {
    const cont = document.getElementById("powerbi-reporte");
    if (!cont) return;
    cont.classList.remove("powerbi-placeholder");
    cont.innerHTML = `<iframe src="${FastMarket.escapeHTML(url)}" allowfullscreen="true"></iframe>`;
}

function limpiarPowerBI() {
    localStorage.removeItem("fastmarket_powerbi");
    setValue("powerbi-url", "");
    const cont = document.getElementById("powerbi-reporte");
    if (cont) {
        cont.classList.add("powerbi-placeholder");
        cont.innerHTML = `<p>Espacio para reporte Power BI</p><small>Cuando pegues el enlace, el reporte aparecerá aquí.</small>`;
    }
    toast("Reporte eliminado.");
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
        alert(mensaje);
        return;
    }
    el.textContent = mensaje;
    el.classList.add("activo");
    setTimeout(() => el.classList.remove("activo"), 2800);
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

function fecha(valor) {
    if (!valor) return "";
    return new Date(valor).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}
