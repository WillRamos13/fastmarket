const API_URL = "https://fastmarket-573w.onrender.com/api";

let productos = [];
let bannersActivos = [];

let categoriaActual = "todos";
let busquedaActual = "";
let ordenActual = "normal";
let carrito = JSON.parse(localStorage.getItem("fashmarket_carrito")) || [];

/* BUSCADOR HEADER */

const busquedaHeader = document.getElementById("busqueda");
const buscadorHeader = document.getElementById("buscador-header");

if (busquedaHeader && buscadorHeader) {
    busquedaHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        busquedaHeader.classList.toggle("activo");
        buscadorHeader.focus();
    });

    buscadorHeader.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

document.addEventListener("click", () => {
    if (busquedaHeader) {
        busquedaHeader.classList.remove("activo");
    }

    const menuCliente = document.getElementById("opciones-cliente");

    if (menuCliente) {
        menuCliente.classList.remove("activo");
    }
});

/* CARRUSEL DE BANNERS */

const sliderContenedor = document.getElementById("slider-contenedor");
const btnAnterior = document.getElementById("anterior");
const btnSiguiente = document.getElementById("siguiente");
const puntosContenedor = document.getElementById("puntos");

const bannersRespaldo = [
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

let slideActual = 0;
let intervaloSlider;

async function cargarBannersDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/banners`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los banners");
        }

        const banners = await respuesta.json();
        bannersActivos = banners.filter((banner) => banner.activo);

        if (bannersActivos.length === 0) {
            bannersActivos = bannersRespaldo;
        }

        cargarBannersSlider();

    } catch (error) {
        console.error("Error al cargar banners:", error);
        bannersActivos = bannersRespaldo;
        cargarBannersSlider();
    }
}

function cargarBannersSlider() {
    if (!sliderContenedor || !puntosContenedor) return;

    sliderContenedor.innerHTML = "";
    puntosContenedor.innerHTML = "";

    bannersActivos.forEach((banner, index) => {
        const slide = document.createElement("div");
        slide.classList.add("slide");

        slide.innerHTML = `
            <img src="${banner.imagen}" alt="${banner.titulo}" onerror="this.src='img/logo.png'">

            <div class="slide-info">
                <h2>${banner.titulo}</h2>
                <p>${banner.descripcion}</p>
            </div>
        `;

        sliderContenedor.appendChild(slide);

        const punto = document.createElement("span");
        punto.classList.add("punto");

        if (index === 0) {
            punto.classList.add("activo");
        }

        punto.addEventListener("click", () => {
            slideActual = index;
            moverSlider();
        });

        puntosContenedor.appendChild(punto);
    });

    slideActual = 0;
    moverSlider();

    if (intervaloSlider) {
        clearInterval(intervaloSlider);
    }

    intervaloSlider = setInterval(siguienteSlide, 4000);
}

function moverSlider() {
    if (!sliderContenedor) return;

    const puntos = document.querySelectorAll(".punto");

    sliderContenedor.style.transform = `translateX(-${slideActual * 100}%)`;

    puntos.forEach((punto) => {
        punto.classList.remove("activo");
    });

    if (puntos[slideActual]) {
        puntos[slideActual].classList.add("activo");
    }
}

function siguienteSlide() {
    if (bannersActivos.length === 0) return;

    slideActual++;

    if (slideActual >= bannersActivos.length) {
        slideActual = 0;
    }

    moverSlider();
}

function anteriorSlide() {
    if (bannersActivos.length === 0) return;

    slideActual--;

    if (slideActual < 0) {
        slideActual = bannersActivos.length - 1;
    }

    moverSlider();
}

if (btnSiguiente) {
    btnSiguiente.addEventListener("click", siguienteSlide);
}

if (btnAnterior) {
    btnAnterior.addEventListener("click", anteriorSlide);
}

/* PRODUCTOS DESDE POSTGRESQL */

const productosContenedor = document.getElementById("productos-contenedor");
const botonesCategoria = document.querySelectorAll(".categoria-btn");
const buscarProducto = document.getElementById("buscar-producto");
const ordenarProducto = document.getElementById("ordenar-producto");
const mensajeVacio = document.getElementById("mensaje-vacio");
const contadorCarrito = document.getElementById("contador-carrito");

document.addEventListener("DOMContentLoaded", async () => {
    await cargarBannersDesdeBackend();
    await cargarProductosDesdeBackend();
    actualizarCarrito();
    actualizarVistaCliente();
});

async function cargarProductosDesdeBackend() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los productos");
        }

        productos = await respuesta.json();
        mostrarProductos();

    } catch (error) {
        console.error("Error al cargar productos:", error);

        if (productosContenedor) {
            productosContenedor.innerHTML = "";
        }

        if (mensajeVacio) {
            mensajeVacio.style.display = "block";
            mensajeVacio.innerHTML = `
                <h3>Error al cargar productos</h3>
                <p>No se pudo conectar con el backend.</p>
            `;
        }
    }
}

botonesCategoria.forEach((boton) => {
    boton.addEventListener("click", () => {
        botonesCategoria.forEach((btn) => {
            btn.classList.remove("activo");
        });

        boton.classList.add("activo");
        categoriaActual = boton.dataset.categoria;
        mostrarProductos();
    });
});

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

function mostrarProductos() {
    if (!productosContenedor) return;

    let lista = productos.filter((producto) => {
        const coincideCategoria =
            categoriaActual === "todos" ||
            producto.categoria === categoriaActual;

        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(busquedaActual) ||
            producto.descripcion.toLowerCase().includes(busquedaActual) ||
            producto.categoria.toLowerCase().includes(busquedaActual);

        return coincideCategoria && coincideBusqueda;
    });

    if (ordenActual === "menor") {
        lista.sort((a, b) => Number(a.precio) - Number(b.precio));
    }

    if (ordenActual === "mayor") {
        lista.sort((a, b) => Number(b.precio) - Number(a.precio));
    }

    productosContenedor.innerHTML = "";

    if (lista.length === 0) {
        if (mensajeVacio) {
            mensajeVacio.style.display = "block";
            mensajeVacio.innerHTML = `
                <h3>No se encontraron productos</h3>
                <p>Intenta con otra búsqueda o categoría.</p>
            `;
        }
        return;
    }

    if (mensajeVacio) {
        mensajeVacio.style.display = "none";
    }

    lista.forEach((producto) => {
        const card = document.createElement("article");
        card.classList.add("producto-card");
        card.setAttribute("onclick", `irDetalleProducto(${producto.id})`);

        card.innerHTML = `
            <div class="producto-img">
                ${producto.oferta ? '<span class="etiqueta-oferta">Oferta</span>' : ''}
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/logo.png'">
            </div>

            <div class="producto-info">
                <small>${formatearCategoria(producto.categoria)}</small>

                <h3>${producto.nombre}</h3>

                <p>${producto.descripcion}</p>

                <div class="precio">
                    <strong>S/ ${Number(producto.precio).toFixed(2)}</strong>
                    ${producto.precioAntes ? `<span>S/ ${Number(producto.precioAntes).toFixed(2)}</span>` : ""}
                </div>

                <div class="cantidad-producto" onclick="event.stopPropagation()">
                    <button onclick="cambiarCantidadProducto(${producto.id}, -1, event)">-</button>
                    <input type="number" id="cantidad-producto-${producto.id}" value="1" min="1">
                    <button onclick="cambiarCantidadProducto(${producto.id}, 1, event)">+</button>
                </div>

                <button class="btn-agregar-producto" onclick="agregarCarrito(${producto.id}, event)">
                    Agregar al carrito
                </button>
            </div>
        `;

        productosContenedor.appendChild(card);
    });
}

function irDetalleProducto(id) {
    window.location.href = `detalle-producto.html?id=${id}`;
}

function cambiarCantidadProducto(id, cambio, e) {
    e.stopPropagation();

    const inputCantidad = document.getElementById(`cantidad-producto-${id}`);

    if (!inputCantidad) return;

    let cantidad = Number(inputCantidad.value);

    if (isNaN(cantidad) || cantidad < 1) {
        cantidad = 1;
    }

    cantidad += cambio;

    if (cantidad < 1) {
        cantidad = 1;
    }

    inputCantidad.value = cantidad;
}

function obtenerCantidadProducto(id) {
    const inputCantidad = document.getElementById(`cantidad-producto-${id}`);

    if (!inputCantidad) {
        return 1;
    }

    let cantidad = Number(inputCantidad.value);

    if (isNaN(cantidad) || cantidad < 1) {
        cantidad = 1;
    }

    return cantidad;
}

/* CARRITO TEMPORAL */

const carritoIcono = document.getElementById("carrito");
const panelCarrito = document.getElementById("panel-carrito");
const overlayCarrito = document.getElementById("overlay-carrito");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const carritoLista = document.getElementById("carrito-lista");
const totalCarrito = document.getElementById("total-carrito");
const carritoSubtitulo = document.getElementById("carrito-subtitulo");
const vaciarCarrito = document.getElementById("vaciar-carrito");
const finalizarCompra = document.getElementById("finalizar-compra");

if (carritoIcono) {
    carritoIcono.addEventListener("click", abrirCarrito);
}

if (cerrarCarrito) {
    cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
}

if (overlayCarrito) {
    overlayCarrito.addEventListener("click", cerrarPanelCarrito);
}

if (vaciarCarrito) {
    vaciarCarrito.addEventListener("click", () => {
        carrito = [];
        guardarCarrito();
        actualizarCarrito();
    });
}

if (finalizarCompra) {
    finalizarCompra.addEventListener("click", () => {
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        const cliente = JSON.parse(localStorage.getItem("fashmarket_cliente"));

        if (!cliente) {
            alert("Primero debes iniciar sesión para finalizar la compra.");
            window.location.href = "login.html";
            return;
        }

        window.location.href = "checkout.html";
    });
}

function abrirCarrito() {
    panelCarrito.classList.add("activo");
    overlayCarrito.classList.add("activo");
}

function cerrarPanelCarrito() {
    panelCarrito.classList.remove("activo");
    overlayCarrito.classList.remove("activo");
}

function agregarCarrito(id, e) {
    if (e) {
        e.stopPropagation();
    }

    const producto = productos.find((item) => Number(item.id) === Number(id));

    if (!producto) return;

    const cantidadSeleccionada = obtenerCantidadProducto(id);

    if (Number(producto.stock) <= 0) {
        mostrarAlertaProducto("Este producto no tiene stock disponible");
        return;
    }

    if (cantidadSeleccionada > Number(producto.stock)) {
        mostrarAlertaProducto("No hay suficiente stock disponible");
        return;
    }

    const productoEnCarrito = carrito.find((item) => Number(item.id) === Number(id));

    if (productoEnCarrito) {
        const nuevaCantidad = productoEnCarrito.cantidad + cantidadSeleccionada;

        if (nuevaCantidad > Number(producto.stock)) {
            mostrarAlertaProducto("No puedes agregar más que el stock disponible");
            return;
        }

        productoEnCarrito.cantidad = nuevaCantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen: producto.imagen,
            cantidad: cantidadSeleccionada
        });
    }

    guardarCarrito();
    actualizarCarrito();
    mostrarAlertaProducto(`${producto.nombre} agregado correctamente`);
}

function actualizarCarrito() {
    if (!carritoLista || !totalCarrito || !contadorCarrito || !carritoSubtitulo) return;

    carritoLista.innerHTML = "";

    if (carrito.length === 0) {
        carritoLista.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
        totalCarrito.textContent = "S/ 0.00";
        contadorCarrito.textContent = "0";
        carritoSubtitulo.textContent = "0 productos agregados";
        return;
    }

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((producto) => {
        total += Number(producto.precio) * Number(producto.cantidad);
        cantidadTotal += Number(producto.cantidad);

        const item = document.createElement("div");
        item.classList.add("item-carrito");

        item.innerHTML = `
            <h4>${producto.nombre}</h4>
            <p>S/ ${Number(producto.precio).toFixed(2)}</p>

            <div class="item-carrito-controles">
                <div class="cantidad-carrito">
                    <button onclick="restarProducto(${producto.id})">-</button>
                    <span>${producto.cantidad}</span>
                    <button onclick="sumarProducto(${producto.id})">+</button>
                </div>

                <button class="eliminar-item" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </div>
        `;

        carritoLista.appendChild(item);
    });

    totalCarrito.textContent = `S/ ${total.toFixed(2)}`;
    contadorCarrito.textContent = cantidadTotal;
    carritoSubtitulo.textContent = `${cantidadTotal} producto(s) agregado(s)`;
}

function sumarProducto(id) {
    const productoCarrito = carrito.find((item) => Number(item.id) === Number(id));
    const productoBase = productos.find((item) => Number(item.id) === Number(id));

    if (!productoCarrito || !productoBase) return;

    if (productoCarrito.cantidad >= Number(productoBase.stock)) {
        mostrarAlertaProducto("No hay más stock disponible");
        return;
    }

    productoCarrito.cantidad++;

    guardarCarrito();
    actualizarCarrito();
}

function restarProducto(id) {
    const producto = carrito.find((item) => Number(item.id) === Number(id));

    if (!producto) return;

    producto.cantidad--;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter((item) => Number(item.id) !== Number(id));
    }

    guardarCarrito();
    actualizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter((item) => Number(item.id) !== Number(id));
    guardarCarrito();
    actualizarCarrito();
}

function guardarCarrito() {
    localStorage.setItem("fashmarket_carrito", JSON.stringify(carrito));
}

/* ALERTA */

function mostrarAlertaProducto(texto) {
    let alerta = document.getElementById("alerta-producto");

    if (!alerta) {
        alerta = document.createElement("div");
        alerta.id = "alerta-producto";
        document.body.appendChild(alerta);
    }

    alerta.textContent = "✅ " + texto;
    alerta.classList.add("activo");

    setTimeout(() => {
        alerta.classList.remove("activo");
    }, 2200);
}

/* MENÚ CLIENTE */

const loginBtn = document.getElementById("login-btn");
const clienteMenu = document.getElementById("cliente-menu");
const btnCliente = document.getElementById("btn-cliente");
const opcionesCliente = document.getElementById("opciones-cliente");
const nombreCliente = document.getElementById("nombre-cliente");
const cerrarSesionCliente = document.getElementById("cerrar-sesion-cliente");

const overlayCliente = document.getElementById("overlay-cliente");
const panelCliente = document.getElementById("panel-cliente");
const cerrarPanelCliente = document.getElementById("cerrar-panel-cliente");
const tituloPanelCliente = document.getElementById("titulo-panel-cliente");
const contenidoPanelCliente = document.getElementById("contenido-panel-cliente");

if (btnCliente) {
    btnCliente.addEventListener("click", (e) => {
        e.stopPropagation();
        opcionesCliente.classList.toggle("activo");
    });
}

if (opcionesCliente) {
    opcionesCliente.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

document.querySelectorAll("[data-cliente-panel]").forEach((boton) => {
    boton.addEventListener("click", () => {
        const panel = boton.dataset.clientePanel;
        abrirPanelCliente(panel);
        opcionesCliente.classList.remove("activo");
    });
});

if (cerrarSesionCliente) {
    cerrarSesionCliente.addEventListener("click", () => {
        localStorage.removeItem("fashmarket_cliente");
        actualizarVistaCliente();
        cerrarPanelClienteLateral();
    });
}

if (cerrarPanelCliente) {
    cerrarPanelCliente.addEventListener("click", cerrarPanelClienteLateral);
}

if (overlayCliente) {
    overlayCliente.addEventListener("click", cerrarPanelClienteLateral);
}

function obtenerCliente() {
    return JSON.parse(localStorage.getItem("fashmarket_cliente"));
}

function actualizarVistaCliente() {
    const cliente = obtenerCliente();

    if (cliente) {
        loginBtn.classList.add("oculto");
        clienteMenu.classList.remove("oculto");
        nombreCliente.textContent = cliente.nombre || "Cliente";
    } else {
        loginBtn.classList.remove("oculto");
        clienteMenu.classList.add("oculto");
        nombreCliente.textContent = "Cliente";
    }
}

function abrirPanelCliente(tipo) {
    const cliente = obtenerCliente();

    if (!cliente) {
        window.location.href = "login.html";
        return;
    }

    panelCliente.classList.add("activo");
    overlayCliente.classList.add("activo");

    if (tipo === "direcciones") {
        tituloPanelCliente.textContent = "Direcciones de entrega";

        if (!cliente.direcciones || cliente.direcciones.length === 0) {
            contenidoPanelCliente.innerHTML = `
                <div class="info-cliente-card">
                    <h3>Sin direcciones</h3>
                    <p>No tienes direcciones guardadas.</p>
                </div>
            `;
            return;
        }

        contenidoPanelCliente.innerHTML = cliente.direcciones.map((direccion, index) => `
            <div class="info-cliente-card">
                <h3>Dirección ${index + 1}</h3>
                <p>${direccion}</p>
            </div>
        `).join("");
    }

    if (tipo === "seguridad") {
        tituloPanelCliente.textContent = "Seguridad";

        contenidoPanelCliente.innerHTML = `
            <div class="info-cliente-card">
                <h3>Cuenta</h3>
                <p>Tu sesión está activa en este navegador.</p>
                <p>Para salir de tu cuenta, usa la opción <strong>Cerrar sesión</strong>.</p>
            </div>
        `;
    }
}

function cerrarPanelClienteLateral() {
    panelCliente.classList.remove("activo");
    overlayCliente.classList.remove("activo");
}

/* CHAT CON IA */

const botonChat = document.getElementById("chat-soporte");
const chatBox = document.getElementById("chat-box");
const cerrarChat = document.getElementById("cerrar-chat");
const enviar = document.getElementById("enviar");
const input = document.getElementById("mensaje");
const contenedorMensajes = document.getElementById("chat-mensajes");

if (botonChat && chatBox) {
    botonChat.addEventListener("click", () => {
        chatBox.style.display = "flex";
    });
}

if (cerrarChat && chatBox) {
    cerrarChat.addEventListener("click", () => {
        chatBox.style.display = "none";
    });
}

if (enviar) {
    enviar.addEventListener("click", enviarMensaje);
}

if (input) {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            enviarMensaje();
        }
    });
}

async function enviarMensaje() {
    const texto = input.value.trim();

    if (texto === "") return;

    agregarMensaje(texto, "usuario");
    input.value = "";

    agregarMensaje("Escribiendo...", "bot");

    try {
        const respuesta = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mensaje: texto })
        });

        if (!respuesta.ok) {
            throw new Error("Error en el servidor");
        }

        const data = await respuesta.json();

        eliminarUltimoMensaje();
        agregarMensaje(data.respuesta || "No recibí respuesta de la IA.", "bot");

    } catch (error) {
        eliminarUltimoMensaje();
        agregarMensaje("Error al conectar con la IA.", "bot");
        console.error("Error real:", error);
    }
}

function agregarMensaje(texto, clase) {
    const div = document.createElement("div");
    div.classList.add("mensaje", clase);
    div.textContent = texto;

    contenedorMensajes.appendChild(div);
    contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function eliminarUltimoMensaje() {
    if (contenedorMensajes.lastChild) {
        contenedorMensajes.removeChild(contenedorMensajes.lastChild);
    }
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