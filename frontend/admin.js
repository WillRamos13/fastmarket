const API_URL = "https://fastmarket-573w.onrender.com/api";

let productos = [];
let banners = [];
let pedidos = [];
let usuarios = [];

/* SELECTORES GENERALES */

const btnMenuAdmin = document.getElementById("btn-menu-admin");
const opcionesAdmin = document.getElementById("opciones-admin");
const nombreAdmin = document.getElementById("nombre-admin");

const paneles = document.querySelectorAll(".panel-admin");
const botonesPanel = document.querySelectorAll("[data-panel]");

/* SELECTORES PRODUCTOS */

const formProducto = document.getElementById("form-producto");
const productoId = document.getElementById("producto-id");
const nombre = document.getElementById("nombre");
const categoria = document.getElementById("categoria");
const precio = document.getElementById("precio");
const precioAntes = document.getElementById("precioAntes");
const stock = document.getElementById("stock");
const imagenProducto = document.getElementById("imagen-producto");
const imagenProductoValor = document.getElementById("imagen-producto-valor");
const previewProducto = document.getElementById("preview-producto");
const previewProductoImg = document.getElementById("preview-producto-img");
const descripcion = document.getElementById("descripcion");
const oferta = document.getElementById("oferta");

const tituloForm = document.getElementById("titulo-form");
const btnLimpiar = document.getElementById("btn-limpiar");
const tablaProductos = document.getElementById("tabla-productos");

const buscarAdmin = document.getElementById("buscar-admin");
const filtroCategoria = document.getElementById("filtro-categoria");

/* SELECTORES PEDIDOS Y USUARIOS */

const tablaPedidos = document.getElementById("tabla-pedidos");
const tablaUsuarios = document.getElementById("tabla-usuarios");

/* SELECTORES POWER BI */

const powerbiUrl = document.getElementById("powerbi-url");
const btnGuardarPowerbi = document.getElementById("btn-guardar-powerbi");
const btnLimpiarPowerbi = document.getElementById("btn-limpiar-powerbi");
const powerbiReporte = document.getElementById("powerbi-reporte");

/* SELECTORES BANNERS */

const formBanner = document.getElementById("form-banner");
const bannerId = document.getElementById("banner-id");
const bannerTitulo = document.getElementById("banner-titulo");
const bannerDescripcion = document.getElementById("banner-descripcion");
const bannerImagen = document.getElementById("banner-imagen");
const bannerImagenValor = document.getElementById("banner-imagen-valor");
const bannerActivo = document.getElementById("banner-activo");
const tituloFormBanner = document.getElementById("titulo-form-banner");
const btnLimpiarBanner = document.getElementById("btn-limpiar-banner");
const listaBanners = document.getElementById("lista-banners");
const buscarBanner = document.getElementById("buscar-banner");
const previewBanner = document.getElementById("preview-banner");
const previewBannerImg = document.getElementById("preview-banner-img");

document.addEventListener("DOMContentLoaded", async () => {
    await iniciarAdmin();
});

async function iniciarAdmin() {
    mostrarNombreAdmin();
    activarMenuAdmin();
    activarCambioPaneles();
    activarEventosProductos();
    activarEventosBanners();
    activarEventosPowerBI();

    await cargarProductosDesdeBackend();
    await cargarBannersDesdeBackend();
    await cargarPedidosDesdeBackend();
    await cargarUsuariosDesdeBackend();
    await cargarIndicesDesdeBackend();

    cargarPowerBI();
}

/* CAMBIO DE PANELES */

function activarCambioPaneles() {
    botonesPanel.forEach((boton) => {
        boton.addEventListener("click", () => {
            const panelId = boton.dataset.panel;
            mostrarPanel(panelId);
        });
    });
}

function mostrarPanel(panelId) {
    paneles.forEach((panel) => {
        panel.classList.remove("activo");
    });

    const panelSeleccionado = document.getElementById(panelId);

    if (panelSeleccionado) {
        panelSeleccionado.classList.add("activo");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    if (opcionesAdmin) {
        opcionesAdmin.classList.remove("activo");
    }
}

function mostrarNombreAdmin() {
    const adminGuardado = JSON.parse(localStorage.getItem("fashmarket_admin")) || null;
    const nombreGuardado = localStorage.getItem("nombre_admin");

    if (adminGuardado && adminGuardado.nombre) {
        nombreAdmin.textContent = adminGuardado.nombre;
    } else {
        nombreAdmin.textContent = nombreGuardado || "Administrador";
    }
}

function activarMenuAdmin() {
    if (!btnMenuAdmin || !opcionesAdmin) return;

    btnMenuAdmin.addEventListener("click", (e) => {
        e.stopPropagation();
        opcionesAdmin.classList.toggle("activo");
    });

    document.addEventListener("click", () => {
        opcionesAdmin.classList.remove("activo");
    });

    opcionesAdmin.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

/* EVENTOS */

function activarEventosProductos() {
    if (formProducto) {
        formProducto.addEventListener("submit", async (e) => {
            e.preventDefault();
            await guardarProducto();
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", limpiarFormularioProducto);
    }

    if (imagenProducto) {
        imagenProducto.addEventListener("change", cargarImagenProducto);
    }

    if (buscarAdmin) {
        buscarAdmin.addEventListener("input", mostrarProductos);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener("change", mostrarProductos);
    }

    if (tablaProductos) {
        tablaProductos.addEventListener("click", async (e) => {
            const botonEditar = e.target.closest(".btn-editar");
            const botonEliminar = e.target.closest(".btn-eliminar");

            if (botonEditar) {
                editarProducto(Number(botonEditar.dataset.id));
            }

            if (botonEliminar) {
                await eliminarProducto(Number(botonEliminar.dataset.id));
            }
        });
    }
}

function activarEventosBanners() {
    if (formBanner) {
        formBanner.addEventListener("submit", async (e) => {
            e.preventDefault();
            await guardarBanner();
        });
    }

    if (btnLimpiarBanner) {
        btnLimpiarBanner.addEventListener("click", limpiarFormularioBanner);
    }

    if (buscarBanner) {
        buscarBanner.addEventListener("input", mostrarBanners);
    }

    if (bannerImagen) {
        bannerImagen.addEventListener("change", cargarImagenBanner);
    }

    if (listaBanners) {
        listaBanners.addEventListener("click", async (e) => {
            const botonEditar = e.target.closest(".btn-editar-banner");
            const botonEliminar = e.target.closest(".btn-eliminar-banner");

            if (botonEditar) {
                editarBanner(Number(botonEditar.dataset.id));
            }

            if (botonEliminar) {
                await eliminarBanner(Number(botonEliminar.dataset.id));
            }
        });
    }
}

function activarEventosPowerBI() {
    if (btnGuardarPowerbi) {
        btnGuardarPowerbi.addEventListener("click", guardarPowerBI);
    }

    if (btnLimpiarPowerbi) {
        btnLimpiarPowerbi.addEventListener("click", limpiarPowerBI);
    }
}

/* PRODUCTOS CON POSTGRESQL */

async function cargarProductosDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los productos");
        }

        productos = await respuesta.json();
        mostrarProductos();
        actualizarEstadisticasLocales();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        mostrarToast("Error al cargar productos desde PostgreSQL");
    }
}

function cargarImagenProducto() {
    const archivo = imagenProducto.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
        mostrarToast("Selecciona una imagen válida");
        imagenProducto.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = () => {
        imagenProductoValor.value = lector.result;
        previewProductoImg.src = lector.result;
        previewProducto.classList.remove("oculto");
    };

    lector.readAsDataURL(archivo);
}

async function guardarProducto() {
    const nombreValor = nombre.value.trim();
    const categoriaValor = categoria.value;
    const precioValor = Number(precio.value);
    const precioAntesValor = precioAntes.value === "" ? null : Number(precioAntes.value);
    const stockValor = Number(stock.value);
    const imagenValor = imagenProductoValor.value.trim() || "img/logo.png";
    const descripcionValor = descripcion.value.trim();
    const ofertaValor = oferta.checked;

    if (nombreValor === "" || descripcionValor === "" || precioValor <= 0 || stockValor < 0) {
        mostrarToast("Completa los datos correctamente");
        return;
    }

    const productoEnviar = {
        nombre: nombreValor,
        categoria: categoriaValor,
        precio: precioValor,
        precioAntes: precioAntesValor,
        stock: stockValor,
        imagen: imagenValor,
        descripcion: descripcionValor,
        oferta: ofertaValor
    };

    try {
        let respuesta;

        if (productoId.value) {
            respuesta = await fetch(`${API_URL}/productos/${productoId.value}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productoEnviar)
            });
        } else {
            respuesta = await fetch(`${API_URL}/productos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productoEnviar)
            });
        }

        if (!respuesta.ok) {
            throw new Error("No se pudo guardar el producto");
        }

        mostrarToast(productoId.value ? "Producto actualizado en PostgreSQL" : "Producto guardado en PostgreSQL");

        await cargarProductosDesdeBackend();
        await cargarIndicesDesdeBackend();
        limpiarFormularioProducto();

    } catch (error) {
        console.error("Error al guardar producto:", error);
        mostrarToast("Error al conectar con el backend");
    }
}

function mostrarProductos() {
    if (!tablaProductos) return;

    const texto = buscarAdmin ? buscarAdmin.value.toLowerCase().trim() : "";
    const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value : "todos";

    const lista = productos.filter((producto) => {
        const coincideTexto =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.descripcion.toLowerCase().includes(texto);

        const coincideCategoria =
            categoriaSeleccionada === "todos" ||
            producto.categoria === categoriaSeleccionada;

        return coincideTexto && coincideCategoria;
    });

    tablaProductos.innerHTML = "";

    if (lista.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="7">No se encontraron productos.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((producto) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>
                <img src="${producto.imagen}" class="img-tabla" alt="${producto.nombre}" onerror="this.src='img/logo.png'">
            </td>

            <td>
                <strong>${producto.nombre}</strong><br>
                <small>${producto.descripcion}</small>
            </td>

            <td>${formatearCategoria(producto.categoria)}</td>

            <td>
                <strong>S/ ${Number(producto.precio).toFixed(2)}</strong>
                ${producto.precioAntes ? `<br><small>Antes: S/ ${Number(producto.precioAntes).toFixed(2)}</small>` : ""}
            </td>

            <td>${producto.stock}</td>

            <td>
                <span class="${producto.oferta ? "estado-oferta" : "estado-normal"}">
                    ${producto.oferta ? "Oferta" : "Normal"}
                </span>
            </td>

            <td>
                <button class="btn-editar" data-id="${producto.id}">Editar</button>
                <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
            </td>
        `;

        tablaProductos.appendChild(fila);
    });
}

function editarProducto(id) {
    const producto = productos.find((item) => Number(item.id) === Number(id));

    if (!producto) return;

    productoId.value = producto.id;
    nombre.value = producto.nombre;
    categoria.value = producto.categoria;
    precio.value = producto.precio;
    precioAntes.value = producto.precioAntes || "";
    stock.value = producto.stock;
    imagenProductoValor.value = producto.imagen;
    previewProductoImg.src = producto.imagen;
    previewProducto.classList.remove("oculto");
    descripcion.value = producto.descripcion;
    oferta.checked = producto.oferta;

    tituloForm.textContent = "Editar producto";
    mostrarPanel("panel-productos");
}

async function eliminarProducto(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");

    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/productos/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el producto");
        }

        mostrarToast("Producto eliminado de PostgreSQL");

        await cargarProductosDesdeBackend();
        await cargarIndicesDesdeBackend();

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        mostrarToast("Error al eliminar producto");
    }
}

function limpiarFormularioProducto() {
    productoId.value = "";
    formProducto.reset();

    imagenProductoValor.value = "";
    previewProductoImg.src = "img/logo.png";
    previewProducto.classList.add("oculto");

    tituloForm.textContent = "Agregar producto";
}

/* BANNERS CON POSTGRESQL */

async function cargarBannersDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/banners`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los banners");
        }

        banners = await respuesta.json();
        mostrarBanners();

    } catch (error) {
        console.error("Error al cargar banners:", error);
        mostrarToast("Error al cargar banners desde PostgreSQL");
    }
}

function cargarImagenBanner() {
    const archivo = bannerImagen.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
        mostrarToast("Selecciona una imagen válida");
        bannerImagen.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = () => {
        bannerImagenValor.value = lector.result;
        previewBannerImg.src = lector.result;
        previewBanner.classList.remove("oculto");
    };

    lector.readAsDataURL(archivo);
}

async function guardarBanner() {
    const tituloValor = bannerTitulo.value.trim();
    const descripcionValor = bannerDescripcion.value.trim();
    const imagenValor = bannerImagenValor.value.trim();
    const activoValor = bannerActivo.checked;

    if (tituloValor === "" || descripcionValor === "") {
        mostrarToast("Completa el título y la descripción del banner");
        return;
    }

    if (!imagenValor && !bannerId.value) {
        mostrarToast("Selecciona una imagen para el banner");
        return;
    }

    const bannerEnviar = {
        titulo: tituloValor,
        descripcion: descripcionValor,
        imagen: imagenValor,
        activo: activoValor
    };

    try {
        let respuesta;

        if (bannerId.value) {
            respuesta = await fetch(`${API_URL}/banners/${bannerId.value}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bannerEnviar)
            });
        } else {
            respuesta = await fetch(`${API_URL}/banners`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bannerEnviar)
            });
        }

        if (!respuesta.ok) {
            throw new Error("No se pudo guardar el banner");
        }

        mostrarToast(bannerId.value ? "Banner actualizado en PostgreSQL" : "Banner guardado en PostgreSQL");

        await cargarBannersDesdeBackend();
        limpiarFormularioBanner();

    } catch (error) {
        console.error("Error al guardar banner:", error);
        mostrarToast("Error al conectar con el backend");
    }
}

function mostrarBanners() {
    if (!listaBanners) return;

    const texto = buscarBanner ? buscarBanner.value.toLowerCase().trim() : "";

    const lista = banners.filter((banner) => {
        return (
            banner.titulo.toLowerCase().includes(texto) ||
            banner.descripcion.toLowerCase().includes(texto)
        );
    });

    listaBanners.innerHTML = "";

    if (lista.length === 0) {
        listaBanners.innerHTML = `
            <div class="banner-card-admin">
                <div class="banner-card-info">
                    <h3>No hay banners</h3>
                    <p>Agrega una imagen para mostrarla en el carrusel de ofertas.</p>
                </div>
            </div>
        `;
        return;
    }

    lista.forEach((banner) => {
        const card = document.createElement("article");
        card.classList.add("banner-card-admin");

        card.innerHTML = `
            <img src="${banner.imagen}" alt="${banner.titulo}" onerror="this.src='img/logo.png'">

            <div class="banner-card-info">
                <h3>${banner.titulo}</h3>
                <p>${banner.descripcion}</p>

                <span class="${banner.activo ? "estado-banner-activo" : "estado-banner-inactivo"}">
                    ${banner.activo ? "Activo" : "Inactivo"}
                </span>

                <div class="banner-card-acciones">
                    <button class="btn-editar-banner" data-id="${banner.id}">Editar</button>
                    <button class="btn-eliminar-banner" data-id="${banner.id}">Eliminar</button>
                </div>
            </div>
        `;

        listaBanners.appendChild(card);
    });
}

function editarBanner(id) {
    const banner = banners.find((item) => Number(item.id) === Number(id));

    if (!banner) return;

    bannerId.value = banner.id;
    bannerTitulo.value = banner.titulo;
    bannerDescripcion.value = banner.descripcion;
    bannerImagenValor.value = banner.imagen;
    bannerActivo.checked = banner.activo;

    previewBannerImg.src = banner.imagen;
    previewBanner.classList.remove("oculto");

    tituloFormBanner.textContent = "Editar banner";
    mostrarPanel("panel-banners");
}

async function eliminarBanner(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar este banner?");

    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/banners/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el banner");
        }

        mostrarToast("Banner eliminado de PostgreSQL");

        await cargarBannersDesdeBackend();

    } catch (error) {
        console.error("Error al eliminar banner:", error);
        mostrarToast("Error al eliminar banner");
    }
}

function limpiarFormularioBanner() {
    bannerId.value = "";
    formBanner.reset();

    bannerImagenValor.value = "";
    previewBannerImg.src = "img/logo.png";
    previewBanner.classList.add("oculto");

    tituloFormBanner.textContent = "Agregar banner";
}

/* PEDIDOS CON POSTGRESQL */

async function cargarPedidosDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/pedidos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los pedidos");
        }

        pedidos = await respuesta.json();
        mostrarPedidos();

    } catch (error) {
        console.error("Error al cargar pedidos:", error);

        if (tablaPedidos) {
            tablaPedidos.innerHTML = `
                <tr>
                    <td colspan="5">No se pudieron cargar los pedidos.</td>
                </tr>
            `;
        }
    }
}

function mostrarPedidos() {
    if (!tablaPedidos) return;

    tablaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
        tablaPedidos.innerHTML = `
            <tr>
                <td colspan="5">No hay pedidos registrados.</td>
            </tr>
        `;
        return;
    }

    pedidos.forEach((pedido) => {
        const fila = document.createElement("tr");

        const idPedido = pedido.id || pedido.codigo || "Sin código";
        const clientePedido = obtenerClientePedido(pedido);
        const productosPedido = obtenerProductosPedido(pedido);
        const totalPedido = Number(pedido.total || 0);
        const estadoPedido = pedido.estado || "pendiente";

        fila.innerHTML = `
            <td>${idPedido}</td>
            <td>${clientePedido}</td>
            <td>${productosPedido}</td>
            <td>S/ ${totalPedido.toFixed(2)}</td>
            <td>
                <span class="estado-pedido ${normalizarEstadoClase(estadoPedido)}">
                    ${formatearEstado(estadoPedido)}
                </span>
            </td>
        `;

        tablaPedidos.appendChild(fila);
    });
}

function obtenerClientePedido(pedido) {
    if (pedido.cliente) return pedido.cliente;
    if (pedido.usuarioNombre) return pedido.usuarioNombre;
    if (pedido.usuario && pedido.usuario.nombre) return pedido.usuario.nombre;
    if (pedido.nombreCliente) return pedido.nombreCliente;
    return "Cliente";
}

function obtenerProductosPedido(pedido) {
    if (pedido.producto) return pedido.producto;

    if (pedido.items && Array.isArray(pedido.items)) {
        return pedido.items.map((item) => {
            const nombreProducto =
                item.productoNombre ||
                item.nombreProducto ||
                item.nombre ||
                "Producto";

            const cantidad = item.cantidad || 1;

            return `${nombreProducto} x${cantidad}`;
        }).join(", ");
    }

    if (pedido.detalles && Array.isArray(pedido.detalles)) {
        return pedido.detalles.map((item) => {
            const nombreProducto =
                item.productoNombre ||
                item.nombreProducto ||
                item.nombre ||
                "Producto";

            const cantidad = item.cantidad || 1;

            return `${nombreProducto} x${cantidad}`;
        }).join(", ");
    }

    return "Productos del pedido";
}

/* USUARIOS CON POSTGRESQL */

async function cargarUsuariosDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/usuarios`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los usuarios");
        }

        usuarios = await respuesta.json();
        mostrarUsuarios();

    } catch (error) {
        console.error("Error al cargar usuarios:", error);

        if (tablaUsuarios) {
            tablaUsuarios.innerHTML = `
                <tr>
                    <td colspan="4">No se pudieron cargar los usuarios.</td>
                </tr>
            `;
        }
    }
}

function mostrarUsuarios() {
    if (!tablaUsuarios) return;

    tablaUsuarios.innerHTML = "";

    if (usuarios.length === 0) {
        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="4">No hay usuarios registrados.</td>
            </tr>
        `;
        return;
    }

    usuarios.forEach((usuario) => {
        const fila = document.createElement("tr");

        const nombreUsuario = usuario.nombre || "Usuario";
        const correoUsuario = usuario.correo || usuario.email || "Sin correo";
        const rolUsuario = usuario.rol || "Cliente";
        const estadoUsuario = usuario.estado || "activo";

        fila.innerHTML = `
            <td>${nombreUsuario}</td>
            <td>${correoUsuario}</td>
            <td>${formatearRol(rolUsuario)}</td>
            <td>
                <span class="${String(estadoUsuario).toLowerCase() === "activo" ? "estado-activo" : "estado-inactivo"}">
                    ${String(estadoUsuario).toLowerCase() === "activo" ? "Activo" : "Inactivo"}
                </span>
            </td>
        `;

        tablaUsuarios.appendChild(fila);
    });
}

/* ÍNDICES CON POSTGRESQL */

async function cargarIndicesDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/admin/indices`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los índices");
        }

        const indices = await respuesta.json();

        document.getElementById("total-productos").textContent =
            indices.totalProductos ?? productos.length;

        document.getElementById("total-ofertas").textContent =
            indices.totalOfertas ?? productos.filter((producto) => producto.oferta).length;

        document.getElementById("total-stock").textContent =
            indices.totalStock ?? productos.reduce((suma, producto) => suma + Number(producto.stock), 0);

        document.getElementById("total-pedidos").textContent =
            indices.totalPedidos ?? pedidos.length;

    } catch (error) {
        console.error("Error al cargar índices:", error);
        actualizarEstadisticasLocales();
    }
}

function actualizarEstadisticasLocales() {
    const totalProductos = productos.length;
    const totalOfertas = productos.filter((producto) => producto.oferta).length;
    const totalStock = productos.reduce((suma, producto) => suma + Number(producto.stock), 0);
    const totalPedidos = pedidos.length;

    const totalProductosElemento = document.getElementById("total-productos");
    const totalOfertasElemento = document.getElementById("total-ofertas");
    const totalStockElemento = document.getElementById("total-stock");
    const totalPedidosElemento = document.getElementById("total-pedidos");

    if (totalProductosElemento) totalProductosElemento.textContent = totalProductos;
    if (totalOfertasElemento) totalOfertasElemento.textContent = totalOfertas;
    if (totalStockElemento) totalStockElemento.textContent = totalStock;
    if (totalPedidosElemento) totalPedidosElemento.textContent = totalPedidos;
}

/* POWER BI */

function guardarPowerBI() {
    const entrada = powerbiUrl.value.trim();

    if (entrada === "") {
        mostrarToast("Pega un enlace o iframe de Power BI");
        return;
    }

    const url = obtenerUrlPowerBI(entrada);

    if (!url || !url.startsWith("http")) {
        mostrarToast("El enlace no es válido");
        return;
    }

    localStorage.setItem("fastmarket_powerbi", url);
    mostrarReportePowerBI(url);
    mostrarToast("Reporte Power BI guardado");
}

function obtenerUrlPowerBI(texto) {
    if (texto.includes("<iframe")) {
        const match = texto.match(/src=["']([^"']+)["']/);

        if (match && match[1]) {
            return match[1];
        }

        return "";
    }

    return texto;
}

function cargarPowerBI() {
    const urlGuardada = localStorage.getItem("fastmarket_powerbi");

    if (urlGuardada) {
        powerbiUrl.value = urlGuardada;
        mostrarReportePowerBI(urlGuardada);
    }
}

function mostrarReportePowerBI(url) {
    powerbiReporte.classList.remove("powerbi-placeholder");

    powerbiReporte.innerHTML = `
        <iframe
            src="${url}"
            allowfullscreen="true">
        </iframe>
    `;
}

function limpiarPowerBI() {
    localStorage.removeItem("fastmarket_powerbi");
    powerbiUrl.value = "";

    powerbiReporte.classList.add("powerbi-placeholder");
    powerbiReporte.innerHTML = `
        <p>Espacio para reporte Power BI</p>
        <small>Cuando pegues el enlace, el reporte aparecerá aquí.</small>
    `;

    mostrarToast("Reporte eliminado");
}

/* UTILIDADES */

function formatearCategoria(valor) {
    const categorias = {
        moda: "Moda",
        tecnologia: "Tecnología",
        hogar: "Hogar",
        accesorios: "Accesorios",
        estudio: "Estudio"
    };

    return categorias[valor] || valor;
}

function formatearEstado(valor) {
    const estados = {
        pendiente: "Pendiente",
        enviado: "Enviado",
        entregado: "Entregado",
        camino: "En camino",
        CAMINO: "En camino",
        PENDIENTE: "Pendiente",
        ENVIADO: "Enviado",
        ENTREGADO: "Entregado"
    };

    return estados[valor] || valor;
}

function formatearRol(valor) {
    const roles = {
        ADMIN: "Administrador",
        CLIENTE: "Cliente",
        admin: "Administrador",
        cliente: "Cliente"
    };

    return roles[valor] || valor;
}

function normalizarEstadoClase(valor) {
    return String(valor)
        .toLowerCase()
        .replaceAll("_", "-")
        .replaceAll(" ", "-");
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");

    toast.textContent = mensaje;
    toast.classList.add("activo");

    setTimeout(() => {
        toast.classList.remove("activo");
    }, 2300);
}