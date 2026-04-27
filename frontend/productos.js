const productosGuardados = JSON.parse(localStorage.getItem("fashmarket_productos"));

const productos = productosGuardados || [
    {
        id: 1,
        nombre: "Audífonos inalámbricos",
        categoria: "tecnologia",
        precio: 79.90,
        precioAntes: 99.90,
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
        imagen: "img/productos/smartwatch.png",
        descripcion: "Reloj inteligente para uso diario.",
        oferta: true
    },
    {
        id: 3,
        nombre: "Soporte para laptop",
        categoria: "tecnologia",
        precio: 49.90,
        precioAntes: null,
        imagen: "img/productos/soporte.png",
        descripcion: "Soporte práctico para estudiar o trabajar.",
        oferta: false
    },
    {
        id: 4,
        nombre: "Casaca ligera",
        categoria: "moda",
        precio: 119.90,
        precioAntes: 149.90,
        imagen: "img/productos/casaca.png",
        descripcion: "Casaca cómoda y fácil de combinar.",
        oferta: true
    },
    {
        id: 5,
        nombre: "Bolso urbano",
        categoria: "moda",
        precio: 59.90,
        precioAntes: null,
        imagen: "img/productos/bolso.png",
        descripcion: "Bolso práctico para salidas o estudio.",
        oferta: false
    },
    {
        id: 6,
        nombre: "Zapatillas urbanas",
        categoria: "moda",
        precio: 149.90,
        precioAntes: null,
        imagen: "img/productos/zapatillas.png",
        descripcion: "Diseño cómodo para uso diario.",
        oferta: false
    },
    {
        id: 7,
        nombre: "Lámpara LED",
        categoria: "hogar",
        precio: 39.90,
        precioAntes: 49.90,
        imagen: "img/productos/lampara.png",
        descripcion: "Ideal para escritorio, dormitorio o sala.",
        oferta: true
    },
    {
        id: 8,
        nombre: "Organizador de escritorio",
        categoria: "hogar",
        precio: 34.90,
        precioAntes: null,
        imagen: "img/productos/organizador.png",
        descripcion: "Mantén tus útiles y accesorios ordenados.",
        oferta: false
    },
    {
        id: 9,
        nombre: "Set de vasos",
        categoria: "hogar",
        precio: 44.90,
        precioAntes: 59.90,
        imagen: "img/productos/vasos.png",
        descripcion: "Set para cocina, comedor o reuniones.",
        oferta: true
    },
    {
        id: 10,
        nombre: "Mochila compacta",
        categoria: "accesorios",
        precio: 69.90,
        precioAntes: null,
        imagen: "img/productos/mochila.png",
        descripcion: "Mochila ligera para clases o uso diario.",
        oferta: false
    },
    {
        id: 11,
        nombre: "Gorra clásica",
        categoria: "accesorios",
        precio: 29.90,
        precioAntes: null,
        imagen: "img/productos/gorra.png",
        descripcion: "Gorra ajustable para estilo casual.",
        oferta: false
    },
    {
        id: 12,
        nombre: "Billetera minimalista",
        categoria: "accesorios",
        precio: 35.90,
        precioAntes: 49.90,
        imagen: "img/productos/billetera.png",
        descripcion: "Billetera práctica y compacta.",
        oferta: true
    }
];

let categoriaActual = "todos";
let busquedaActual = "";
let ordenActual = "normal";
let carrito = JSON.parse(localStorage.getItem("fashmarket_carrito")) || [];

const busquedaHeader = document.getElementById("busqueda");
const buscadorHeader = document.getElementById("buscador-header");

busquedaHeader.addEventListener("click", (e) => {
    e.stopPropagation();
    busquedaHeader.classList.toggle("activo");
    buscadorHeader.focus();
});

buscadorHeader.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.addEventListener("click", () => {
    busquedaHeader.classList.remove("activo");

    if (opcionesCliente) {
        opcionesCliente.classList.remove("activo");
    }
});

/* CARRUSEL DE BANNERS */

const sliderContenedor = document.getElementById("slider-contenedor");
const btnAnterior = document.getElementById("anterior");
const btnSiguiente = document.getElementById("siguiente");
const puntosContenedor = document.getElementById("puntos");

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

let banners = JSON.parse(localStorage.getItem("fashmarket_banners")) || bannersIniciales;
let bannersActivos = banners.filter((banner) => banner.activo);
let slideActual = 0;
let intervaloSlider;

if (bannersActivos.length === 0) {
    bannersActivos = bannersIniciales;
}

cargarBannersSlider();

function cargarBannersSlider() {
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

    moverSlider();

    if (intervaloSlider) {
        clearInterval(intervaloSlider);
    }

    intervaloSlider = setInterval(siguienteSlide, 4000);
}

function moverSlider() {
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
    slideActual++;

    if (slideActual >= bannersActivos.length) {
        slideActual = 0;
    }

    moverSlider();
}

function anteriorSlide() {
    slideActual--;

    if (slideActual < 0) {
        slideActual = bannersActivos.length - 1;
    }

    moverSlider();
}

btnSiguiente.addEventListener("click", siguienteSlide);
btnAnterior.addEventListener("click", anteriorSlide);

/* PRODUCTOS */

const productosContenedor = document.getElementById("productos-contenedor");
const botonesCategoria = document.querySelectorAll(".categoria-btn");
const buscarProducto = document.getElementById("buscar-producto");
const ordenarProducto = document.getElementById("ordenar-producto");
const mensajeVacio = document.getElementById("mensaje-vacio");
const contadorCarrito = document.getElementById("contador-carrito");

document.addEventListener("DOMContentLoaded", () => {
    mostrarProductos();
    actualizarCarrito();
    actualizarVistaCliente();
});

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

buscarProducto.addEventListener("input", () => {
    busquedaActual = buscarProducto.value.toLowerCase().trim();
    mostrarProductos();
});

ordenarProducto.addEventListener("change", () => {
    ordenActual = ordenarProducto.value;
    mostrarProductos();
});

function mostrarProductos() {
    let lista = productos.filter((producto) => {
        const coincideCategoria = categoriaActual === "todos" || producto.categoria === categoriaActual;

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
        mensajeVacio.style.display = "block";
        return;
    }

    mensajeVacio.style.display = "none";

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
                <small>${producto.categoria}</small>

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

/* CARRITO */

const carritoIcono = document.getElementById("carrito");
const panelCarrito = document.getElementById("panel-carrito");
const overlayCarrito = document.getElementById("overlay-carrito");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const carritoLista = document.getElementById("carrito-lista");
const totalCarrito = document.getElementById("total-carrito");
const carritoSubtitulo = document.getElementById("carrito-subtitulo");
const vaciarCarrito = document.getElementById("vaciar-carrito");
const finalizarCompra = document.getElementById("finalizar-compra");

carritoIcono.addEventListener("click", () => {
    abrirCarrito();
});

cerrarCarrito.addEventListener("click", () => {
    cerrarPanelCarrito();
});

overlayCarrito.addEventListener("click", () => {
    cerrarPanelCarrito();
});

vaciarCarrito.addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
});

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

    const productoEnCarrito = carrito.find((item) => Number(item.id) === Number(id));

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidadSeleccionada;
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
    const producto = carrito.find((item) => Number(item.id) === Number(id));

    if (producto) {
        producto.cantidad++;
    }

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

/* ALERTA PRODUCTO AGREGADO */

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

btnCliente.addEventListener("click", (e) => {
    e.stopPropagation();
    opcionesCliente.classList.toggle("activo");
});

opcionesCliente.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.querySelectorAll("[data-cliente-panel]").forEach((boton) => {
    boton.addEventListener("click", () => {
        const panel = boton.dataset.clientePanel;
        abrirPanelCliente(panel);
        opcionesCliente.classList.remove("activo");
    });
});

cerrarSesionCliente.addEventListener("click", () => {
    localStorage.removeItem("fashmarket_cliente");
    actualizarVistaCliente();
    cerrarPanelClienteLateral();
});

cerrarPanelCliente.addEventListener("click", cerrarPanelClienteLateral);
overlayCliente.addEventListener("click", cerrarPanelClienteLateral);

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

botonChat.addEventListener("click", () => {
    chatBox.style.display = "flex";
});

cerrarChat.addEventListener("click", () => {
    chatBox.style.display = "none";
});

enviar.addEventListener("click", enviarMensaje);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        enviarMensaje();
    }
});

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