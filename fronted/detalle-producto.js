document.addEventListener("DOMContentLoaded", () => {

    const productosGuardados = JSON.parse(localStorage.getItem("fashmarket_productos"));

    const productosBase = [
        {
            id: 1,
            nombre: "Audífonos inalámbricos",
            categoria: "tecnologia",
            precio: 79.90,
            precioAntes: 99.90,
            imagen: "img/productos/audifonos.png",
            descripcion: "Audífonos cómodos para música, clases, llamadas y entretenimiento diario.",
            oferta: true
        },
        {
            id: 2,
            nombre: "Smartwatch básico",
            categoria: "tecnologia",
            precio: 99.90,
            precioAntes: 129.90,
            imagen: "img/productos/smartwatch.png",
            descripcion: "Reloj inteligente para controlar actividad, notificaciones y uso diario.",
            oferta: true
        },
        {
            id: 3,
            nombre: "Casaca ligera",
            categoria: "moda",
            precio: 119.90,
            precioAntes: 149.90,
            imagen: "img/productos/casaca.png",
            descripcion: "Casaca cómoda, ligera y fácil de combinar para uso casual.",
            oferta: true
        },
        {
            id: 4,
            nombre: "Lámpara LED",
            categoria: "hogar",
            precio: 39.90,
            precioAntes: 49.90,
            imagen: "img/productos/lampara.png",
            descripcion: "Lámpara ideal para escritorio, dormitorio o espacios de estudio.",
            oferta: true
        }
    ];

    const productos = productosGuardados || productosBase;

    const busqueda = document.getElementById("busqueda");
    const buscador = document.getElementById("buscador");

    const loginBtn = document.getElementById("login-btn");
    const clienteMenu = document.getElementById("cliente-menu");
    const btnCliente = document.getElementById("btn-cliente");
    const opcionesCliente = document.getElementById("opciones-cliente");
    const nombreCliente = document.getElementById("nombre-cliente");
    const cerrarSesionCliente = document.getElementById("cerrar-sesion-cliente");

    const productoImg = document.getElementById("producto-img");
    const etiquetaOferta = document.getElementById("etiqueta-oferta");
    const productoCategoria = document.getElementById("producto-categoria");
    const productoNombre = document.getElementById("producto-nombre");
    const productoDescripcion = document.getElementById("producto-descripcion");
    const productoPrecio = document.getElementById("producto-precio");
    const productoPrecioAntes = document.getElementById("producto-precio-antes");
    const cantidadTexto = document.getElementById("cantidad");
    const restar = document.getElementById("restar");
    const sumar = document.getElementById("sumar");
    const agregarCarrito = document.getElementById("agregar-carrito");
    const comprarAhora = document.getElementById("comprar-ahora");
    const mensajeDetalle = document.getElementById("mensaje-detalle");
    const productosRelacionados = document.getElementById("productos-relacionados");

    let cantidad = 1;
    let productoActual = null;

    iniciar();

    function iniciar() {
        activarBuscador();
        activarMenuCliente();
        cargarProducto();
    }

    function activarBuscador() {
        if (busqueda) {
            busqueda.addEventListener("click", (e) => {
                e.stopPropagation();
                busqueda.classList.toggle("activo");

                if (busqueda.classList.contains("activo") && buscador) {
                    buscador.focus();
                }
            });
        }

        if (buscador) {
            buscador.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }

        document.addEventListener("click", () => {
            if (busqueda) busqueda.classList.remove("activo");
            if (opcionesCliente) opcionesCliente.classList.remove("activo");
        });
    }

    function activarMenuCliente() {
        const cliente = JSON.parse(localStorage.getItem("fashmarket_cliente"));

        if (cliente) {
            loginBtn.classList.add("oculto");
            clienteMenu.classList.remove("oculto");
            nombreCliente.textContent = cliente.nombre || "Cliente";
        } else {
            loginBtn.classList.remove("oculto");
            clienteMenu.classList.add("oculto");
        }

        if (btnCliente && opcionesCliente) {
            btnCliente.addEventListener("click", (e) => {
                e.stopPropagation();
                opcionesCliente.classList.toggle("activo");
            });

            opcionesCliente.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }

        if (cerrarSesionCliente) {
            cerrarSesionCliente.addEventListener("click", () => {
                localStorage.removeItem("fashmarket_cliente");
                window.location.href = "login.html";
            });
        }
    }

    function cargarProducto() {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get("id"));

        productoActual = productos.find((producto) => Number(producto.id) === id) || productos[0];

        productoImg.src = productoActual.imagen || "img/logo.png";
        productoImg.onerror = () => {
            productoImg.src = "img/logo.png";
        };

        productoCategoria.textContent = productoActual.categoria;
        productoNombre.textContent = productoActual.nombre;
        productoDescripcion.textContent = productoActual.descripcion;
        productoPrecio.textContent = `S/ ${Number(productoActual.precio).toFixed(2)}`;

        if (productoActual.precioAntes) {
            productoPrecioAntes.textContent = `S/ ${Number(productoActual.precioAntes).toFixed(2)}`;
        } else {
            productoPrecioAntes.textContent = "";
        }

        if (productoActual.oferta) {
            etiquetaOferta.classList.remove("oculto");
        } else {
            etiquetaOferta.classList.add("oculto");
        }

        mostrarRelacionados();
    }

    sumar.addEventListener("click", () => {
        cantidad++;
        cantidadTexto.textContent = cantidad;
    });

    restar.addEventListener("click", () => {
        if (cantidad > 1) {
            cantidad--;
            cantidadTexto.textContent = cantidad;
        }
    });

    agregarCarrito.addEventListener("click", () => {
        agregarProductoCarrito();
        mensajeDetalle.textContent = "Producto agregado al carrito.";
    });

    comprarAhora.addEventListener("click", () => {
        agregarProductoCarrito();
        window.location.href = "checkout.html";
    });

    function agregarProductoCarrito() {
        let carrito = JSON.parse(localStorage.getItem("fashmarket_carrito")) || [];

        const encontrado = carrito.find((item) => Number(item.id) === Number(productoActual.id));

        if (encontrado) {
            encontrado.cantidad += cantidad;
        } else {
            carrito.push({
                id: productoActual.id,
                nombre: productoActual.nombre,
                precio: Number(productoActual.precio),
                imagen: productoActual.imagen,
                cantidad: cantidad
            });
        }

        localStorage.setItem("fashmarket_carrito", JSON.stringify(carrito));
    }

    function mostrarRelacionados() {
        productosRelacionados.innerHTML = "";

        const relacionados = productos
            .filter((producto) => producto.categoria === productoActual.categoria && producto.id !== productoActual.id)
            .slice(0, 4);

        const lista = relacionados.length > 0 ? relacionados : productos.filter((producto) => producto.id !== productoActual.id).slice(0, 4);

        lista.forEach((producto) => {
            const card = document.createElement("article");
            card.classList.add("card-relacionado");

            card.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/logo.png'">

                <div>
                    <h3>${producto.nombre}</h3>
                    <p>S/ ${Number(producto.precio).toFixed(2)}</p>
                    <a href="detalle-producto.html?id=${producto.id}">Ver detalle</a>
                </div>
            `;

            productosRelacionados.appendChild(card);
        });
    }

});