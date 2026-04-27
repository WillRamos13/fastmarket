const productosIniciales = [
    {
        id: 1,
        nombre: "Audífonos inalámbricos",
        categoria: "tecnologia",
        precio: 79.90,
        precioAntes: 99.90,
        stock: 12,
        imagen: "img/productos/audifonos.png",
        descripcion: "Audífonos cómodos para música, clases y llamadas.",
        oferta: true
    },
    {
        id: 2,
        nombre: "Smartwatch básico",
        categoria: "tecnologia",
        precio: 99.90,
        precioAntes: 129.90,
        stock: 8,
        imagen: "img/productos/smartwatch.png",
        descripcion: "Reloj inteligente para uso diario.",
        oferta: true
    },
    {
        id: 3,
        nombre: "Casaca ligera",
        categoria: "moda",
        precio: 119.90,
        precioAntes: 149.90,
        stock: 6,
        imagen: "img/productos/casaca.png",
        descripcion: "Casaca cómoda y fácil de combinar.",
        oferta: true
    },
    {
        id: 4,
        nombre: "Lámpara LED",
        categoria: "hogar",
        precio: 39.90,
        precioAntes: 49.90,
        stock: 15,
        imagen: "img/productos/lampara.png",
        descripcion: "Ideal para escritorio, dormitorio o sala.",
        oferta: true
    },
    {
        id: 5,
        nombre: "Mochila compacta",
        categoria: "accesorios",
        precio: 69.90,
        precioAntes: null,
        stock: 10,
        imagen: "img/productos/mochila.png",
        descripcion: "Mochila ligera para clases o uso diario.",
        oferta: false
    }
];

const pedidosIniciales = [
    {
        id: "P001",
        cliente: "Juan Pérez",
        producto: "Audífonos inalámbricos",
        total: 79.90,
        estado: "pendiente"
    },
    {
        id: "P002",
        cliente: "María Torres",
        producto: "Casaca ligera",
        total: 119.90,
        estado: "enviado"
    },
    {
        id: "P003",
        cliente: "Carlos Ramos",
        producto: "Lámpara LED",
        total: 39.90,
        estado: "entregado"
    }
];

const bannersIniciales = [
    {
        id: 1,
        titulo: "Ofertas disponibles",
        descripcion: "Promociones destacadas para tus compras.",
        imagen: "img/fondo1.png",
        activo: true
    },
    {
        id: 2,
        titulo: "Productos destacados",
        descripcion: "Encuentra novedades y descuentos especiales.",
        imagen: "img/abrir.png",
        activo: true
    },
    {
        id: 3,
        titulo: "Compra segura",
        descripcion: "Atención rápida y seguimiento de pedidos.",
        imagen: "img/intro.png",
        activo: true
    }
];

const usuariosIniciales = [
    {
        nombre: "Juan Pérez",
        correo: "juan@gmail.com",
        rol: "Cliente",
        estado: "activo"
    },
    {
        nombre: "María Torres",
        correo: "maria@gmail.com",
        rol: "Cliente",
        estado: "activo"
    },
    {
        nombre: "Carlos Ramos",
        correo: "carlos@gmail.com",
        rol: "Cliente",
        estado: "inactivo"
    },
    {
        nombre: "Administrador",
        correo: "admin@fashmarket.com",
        rol: "Administrador",
        estado: "activo"
    }
];

let productos = cargarStorage("fashmarket_productos", productosIniciales);
let pedidos = cargarStorage("fashmarket_pedidos", pedidosIniciales);
let usuarios = cargarStorage("fashmarket_usuarios", usuariosIniciales);
let banners = cargarStorage("fashmarket_banners", bannersIniciales);

const btnMenuAdmin = document.getElementById("btn-menu-admin");
const opcionesAdmin = document.getElementById("opciones-admin");
const nombreAdmin = document.getElementById("nombre-admin");

const paneles = document.querySelectorAll(".panel-admin");
const botonesPanel = document.querySelectorAll("[data-panel]");

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
const tablaPedidos = document.getElementById("tabla-pedidos");
const tablaUsuarios = document.getElementById("tabla-usuarios");

const buscarAdmin = document.getElementById("buscar-admin");
const filtroCategoria = document.getElementById("filtro-categoria");

const powerbiUrl = document.getElementById("powerbi-url");
const btnGuardarPowerbi = document.getElementById("btn-guardar-powerbi");
const btnLimpiarPowerbi = document.getElementById("btn-limpiar-powerbi");
const powerbiReporte = document.getElementById("powerbi-reporte");

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

document.addEventListener("DOMContentLoaded", () => {
    iniciarAdmin();
});

function iniciarAdmin() {
    mostrarNombreAdmin();
    activarMenuAdmin();
    activarCambioPaneles();
    guardarDatosBase();
    mostrarProductos();
    mostrarPedidos();
    mostrarUsuarios();
    mostrarBanners();
    actualizarEstadisticas();
    cargarPowerBI();
}

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

    opcionesAdmin.classList.remove("activo");
}

function mostrarNombreAdmin() {
    const nombreGuardado = localStorage.getItem("nombre_admin");
    nombreAdmin.textContent = nombreGuardado || "Administrador";
}

function activarMenuAdmin() {
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

/* EVENTOS PRODUCTOS */

formProducto.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarProducto();
});

btnLimpiar.addEventListener("click", limpiarFormulario);

imagenProducto.addEventListener("change", cargarImagenProducto);

buscarAdmin.addEventListener("input", mostrarProductos);
filtroCategoria.addEventListener("change", mostrarProductos);

tablaProductos.addEventListener("click", (e) => {
    const botonEditar = e.target.closest(".btn-editar");
    const botonEliminar = e.target.closest(".btn-eliminar");

    if (botonEditar) {
        editarProducto(Number(botonEditar.dataset.id));
    }

    if (botonEliminar) {
        eliminarProducto(Number(botonEliminar.dataset.id));
    }
});

/* EVENTOS BANNERS */

formBanner.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarBanner();
});

btnLimpiarBanner.addEventListener("click", limpiarFormularioBanner);
buscarBanner.addEventListener("input", mostrarBanners);
bannerImagen.addEventListener("change", cargarImagenBanner);

listaBanners.addEventListener("click", (e) => {
    const botonEditar = e.target.closest(".btn-editar-banner");
    const botonEliminar = e.target.closest(".btn-eliminar-banner");

    if (botonEditar) {
        editarBanner(Number(botonEditar.dataset.id));
    }

    if (botonEliminar) {
        eliminarBanner(Number(botonEliminar.dataset.id));
    }
});

/* EVENTOS POWER BI */

btnGuardarPowerbi.addEventListener("click", guardarPowerBI);
btnLimpiarPowerbi.addEventListener("click", limpiarPowerBI);

/* PRODUCTOS */

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

function guardarProducto() {
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

    if (productoId.value) {
        const id = Number(productoId.value);
        const producto = productos.find((item) => item.id === id);

        if (!producto) return;

        producto.nombre = nombreValor;
        producto.categoria = categoriaValor;
        producto.precio = precioValor;
        producto.precioAntes = precioAntesValor;
        producto.stock = stockValor;
        producto.imagen = imagenValor;
        producto.descripcion = descripcionValor;
        producto.oferta = ofertaValor;

        mostrarToast("Producto actualizado");
    } else {
        const nuevoProducto = {
            id: Date.now(),
            nombre: nombreValor,
            categoria: categoriaValor,
            precio: precioValor,
            precioAntes: precioAntesValor,
            stock: stockValor,
            imagen: imagenValor,
            descripcion: descripcionValor,
            oferta: ofertaValor
        };

        productos.push(nuevoProducto);
        mostrarToast("Producto agregado");
    }

    guardarDatosBase();
    mostrarProductos();
    actualizarEstadisticas();
    limpiarFormulario();
}

function mostrarProductos() {
    const texto = buscarAdmin.value.toLowerCase().trim();
    const categoriaSeleccionada = filtroCategoria.value;

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
    const producto = productos.find((item) => item.id === id);

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

function eliminarProducto(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");

    if (!confirmar) return;

    productos = productos.filter((producto) => producto.id !== id);

    guardarDatosBase();
    mostrarProductos();
    actualizarEstadisticas();
    mostrarToast("Producto eliminado");
}

function limpiarFormulario() {
    productoId.value = "";
    formProducto.reset();

    imagenProductoValor.value = "";
    previewProductoImg.src = "img/logo.png";
    previewProducto.classList.add("oculto");

    tituloForm.textContent = "Agregar producto";
}

/* BANNERS */

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

function guardarBanner() {
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

    if (bannerId.value) {
        const id = Number(bannerId.value);
        const banner = banners.find((item) => item.id === id);

        if (!banner) return;

        banner.titulo = tituloValor;
        banner.descripcion = descripcionValor;
        banner.imagen = imagenValor || banner.imagen;
        banner.activo = activoValor;

        mostrarToast("Banner actualizado");
    } else {
        const nuevoBanner = {
            id: Date.now(),
            titulo: tituloValor,
            descripcion: descripcionValor,
            imagen: imagenValor,
            activo: activoValor
        };

        banners.push(nuevoBanner);
        mostrarToast("Banner agregado");
    }

    guardarDatosBase();
    mostrarBanners();
    limpiarFormularioBanner();
}

function mostrarBanners() {
    const texto = buscarBanner.value.toLowerCase().trim();

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
    const banner = banners.find((item) => item.id === id);

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

function eliminarBanner(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar este banner?");

    if (!confirmar) return;

    banners = banners.filter((banner) => banner.id !== id);

    guardarDatosBase();
    mostrarBanners();
    mostrarToast("Banner eliminado");
}

function limpiarFormularioBanner() {
    bannerId.value = "";
    formBanner.reset();

    bannerImagenValor.value = "";
    previewBannerImg.src = "img/logo.png";
    previewBanner.classList.add("oculto");

    tituloFormBanner.textContent = "Agregar banner";
}

/* PEDIDOS */

function mostrarPedidos() {
    tablaPedidos.innerHTML = "";

    pedidos.forEach((pedido) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.producto}</td>
            <td>S/ ${Number(pedido.total).toFixed(2)}</td>
            <td>
                <span class="estado-pedido ${pedido.estado}">
                    ${formatearEstado(pedido.estado)}
                </span>
            </td>
        `;

        tablaPedidos.appendChild(fila);
    });
}

/* USUARIOS */

function mostrarUsuarios() {
    tablaUsuarios.innerHTML = "";

    usuarios.forEach((usuario) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${usuario.nombre}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.rol}</td>
            <td>
                <span class="${usuario.estado === "activo" ? "estado-activo" : "estado-inactivo"}">
                    ${usuario.estado === "activo" ? "Activo" : "Inactivo"}
                </span>
            </td>
        `;

        tablaUsuarios.appendChild(fila);
    });
}

/* ESTADISTICAS */

function actualizarEstadisticas() {
    const totalProductos = productos.length;
    const totalOfertas = productos.filter((producto) => producto.oferta).length;
    const totalStock = productos.reduce((suma, producto) => suma + Number(producto.stock), 0);
    const totalPedidos = pedidos.length;

    document.getElementById("total-productos").textContent = totalProductos;
    document.getElementById("total-ofertas").textContent = totalOfertas;
    document.getElementById("total-stock").textContent = totalStock;
    document.getElementById("total-pedidos").textContent = totalPedidos;
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

    localStorage.setItem("fashmarket_powerbi", url);
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
    const urlGuardada = localStorage.getItem("fashmarket_powerbi");

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
    localStorage.removeItem("fashmarket_powerbi");
    powerbiUrl.value = "";

    powerbiReporte.classList.add("powerbi-placeholder");
    powerbiReporte.innerHTML = `
        <p>Espacio para reporte Power BI</p>
        <small>Cuando pegues el enlace, el reporte aparecerá aquí.</small>
    `;

    mostrarToast("Reporte eliminado");
}

/* UTILIDADES */

function guardarDatosBase() {
    localStorage.setItem("fashmarket_productos", JSON.stringify(productos));
    localStorage.setItem("fashmarket_pedidos", JSON.stringify(pedidos));
    localStorage.setItem("fashmarket_usuarios", JSON.stringify(usuarios));
    localStorage.setItem("fashmarket_banners", JSON.stringify(banners));
}

function cargarStorage(clave, datosIniciales) {
    const datos = localStorage.getItem(clave);

    if (datos) {
        return JSON.parse(datos);
    }

    localStorage.setItem(clave, JSON.stringify(datosIniciales));
    return datosIniciales;
}

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
        entregado: "Entregado"
    };

    return estados[valor] || valor;
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");

    toast.textContent = mensaje;
    toast.classList.add("activo");

    setTimeout(() => {
        toast.classList.remove("activo");
    }, 2300);
}