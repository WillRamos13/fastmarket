document.addEventListener("DOMContentLoaded", () => {

    const busqueda = document.getElementById("busqueda");
    const buscador = document.getElementById("buscador");

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

        buscador.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const texto = buscador.value.trim();

                if (texto !== "") {
                    alert("Buscando: " + texto);
                    buscador.value = "";
                    busqueda.classList.remove("activo");
                }
            }
        });
    }

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

    const totalPedidos = document.getElementById("total-pedidos");
    const pedidosPendientes = document.getElementById("pedidos-pendientes");
    const pedidosCamino = document.getElementById("pedidos-camino");
    const pedidosEntregados = document.getElementById("pedidos-entregados");

    const contenedorPedidos = document.getElementById("contenedor-pedidos");
    const detalleVacio = document.getElementById("detalle-vacio");
    const detalleContenido = document.getElementById("detalle-contenido");

    const detalleCodigo = document.getElementById("detalle-codigo");
    const detalleFecha = document.getElementById("detalle-fecha");
    const detalleEstado = document.getElementById("detalle-estado");
    const detalleCliente = document.getElementById("detalle-cliente");
    const detalleTotal = document.getElementById("detalle-total");
    const detalleMetodo = document.getElementById("detalle-metodo");
    const detalleEstimada = document.getElementById("detalle-estimada");
    const detalleDireccion = document.getElementById("detalle-direccion");
    const detalleProductos = document.getElementById("detalle-productos");
    const mapaPedido = document.getElementById("mapa-pedido");

    actualizarVistaCliente();
    cargarPedidos();

    if (btnCliente && opcionesCliente) {
        btnCliente.addEventListener("click", (e) => {
            e.stopPropagation();
            opcionesCliente.classList.toggle("activo");
        });

        opcionesCliente.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    document.querySelectorAll("[data-cliente-panel]").forEach((boton) => {
        boton.addEventListener("click", () => {
            const panel = boton.dataset.clientePanel;
            abrirPanelCliente(panel);

            if (opcionesCliente) {
                opcionesCliente.classList.remove("activo");
            }
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

    document.addEventListener("click", () => {
        if (busqueda) {
            busqueda.classList.remove("activo");
        }

        if (opcionesCliente) {
            opcionesCliente.classList.remove("activo");
        }
    });

    function obtenerCliente() {
        return JSON.parse(localStorage.getItem("fashmarket_cliente"));
    }

    function actualizarVistaCliente() {
        const cliente = obtenerCliente();

        if (!loginBtn || !clienteMenu || !nombreCliente) return;

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

        if (tipo === "perfil") {
            tituloPanelCliente.textContent = "Mi perfil";

            contenidoPanelCliente.innerHTML = `
                <div class="info-cliente-card">
                    <h3>Datos personales</h3>
                    <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                    <p><strong>Correo:</strong> ${cliente.correo}</p>
                    <p><strong>Teléfono:</strong> ${cliente.telefono || "No registrado"}</p>
                </div>
            `;
        }

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
        if (panelCliente) {
            panelCliente.classList.remove("activo");
        }

        if (overlayCliente) {
            overlayCliente.classList.remove("activo");
        }
    }

    function cargarPedidos() {
        const cliente = obtenerCliente();

        if (!cliente) {
            contenedorPedidos.innerHTML = `
                <div class="pedido-item">
                    <h3>Inicia sesión</h3>
                    <p>Para ver tus pedidos primero debes iniciar sesión.</p>
                    <span class="estado pendiente">Pendiente</span>
                </div>
            `;

            totalPedidos.textContent = "0";
            pedidosPendientes.textContent = "0";
            pedidosCamino.textContent = "0";
            pedidosEntregados.textContent = "0";

            return;
        }

        let pedidos = cliente.pedidos || [];

        if (pedidos.length === 0) {
            pedidos = crearPedidosDeEjemplo(cliente);
        }

        actualizarResumen(pedidos);
        mostrarListaPedidos(pedidos, cliente);
    }

    function crearPedidosDeEjemplo(cliente) {
        const direccionBase = cliente.direcciones && cliente.direcciones.length > 0
            ? cliente.direcciones[0]
            : "Ica, Perú";

        return [
            {
                codigo: "P001",
                fecha: "2026-04-26",
                estado: "camino",
                metodo: "Entrega a domicilio",
                direccion: direccionBase,
                entregaEstimada: "Hoy entre 4:00 p.m. y 7:00 p.m.",
                total: 79.90,
                productos: [
                    {
                        nombre: "Audífonos inalámbricos",
                        cantidad: 1,
                        precio: 79.90
                    }
                ]
            },
            {
                codigo: "P002",
                fecha: "2026-04-24",
                estado: "entregado",
                metodo: "Entrega a domicilio",
                direccion: direccionBase,
                entregaEstimada: "Entregado",
                total: 39.90,
                productos: [
                    {
                        nombre: "Lámpara LED",
                        cantidad: 1,
                        precio: 39.90
                    }
                ]
            }
        ];
    }

    function actualizarResumen(pedidos) {
        totalPedidos.textContent = pedidos.length;

        pedidosPendientes.textContent = pedidos.filter((pedido) => pedido.estado === "pendiente").length;

        pedidosCamino.textContent = pedidos.filter((pedido) => {
            return pedido.estado === "camino" || pedido.estado === "reparto";
        }).length;

        pedidosEntregados.textContent = pedidos.filter((pedido) => pedido.estado === "entregado").length;
    }

    function mostrarListaPedidos(pedidos, cliente) {
        contenedorPedidos.innerHTML = "";

        pedidos.forEach((pedido, index) => {
            const item = document.createElement("div");
            item.classList.add("pedido-item");

            if (index === 0) {
                item.classList.add("activo");
            }

            item.innerHTML = `
                <h3>Pedido ${pedido.codigo}</h3>
                <p>${pedido.fecha}</p>
                <p>Total: S/ ${Number(pedido.total).toFixed(2)}</p>
                <span class="estado ${pedido.estado}">
                    ${formatearEstado(pedido.estado)}
                </span>
            `;

            item.addEventListener("click", () => {
                document.querySelectorAll(".pedido-item").forEach((pedidoItem) => {
                    pedidoItem.classList.remove("activo");
                });

                item.classList.add("activo");
                mostrarDetallePedido(pedido, cliente);
            });

            contenedorPedidos.appendChild(item);
        });

        if (pedidos.length > 0) {
            mostrarDetallePedido(pedidos[0], cliente);
        }
    }

    function mostrarDetallePedido(pedido, cliente) {
        detalleVacio.classList.add("oculto");
        detalleContenido.classList.remove("oculto");

        detalleCodigo.textContent = `Pedido ${pedido.codigo}`;
        detalleFecha.textContent = `Fecha: ${pedido.fecha}`;
        detalleEstado.textContent = formatearEstado(pedido.estado);
        detalleCliente.textContent = cliente.nombre;
        detalleTotal.textContent = `S/ ${Number(pedido.total).toFixed(2)}`;
        detalleMetodo.textContent = pedido.metodo;
        detalleEstimada.textContent = pedido.entregaEstimada;
        detalleDireccion.textContent = pedido.direccion;

        detalleProductos.innerHTML = "";

        pedido.productos.forEach((producto) => {
            const div = document.createElement("div");
            div.classList.add("producto-pedido");

            div.innerHTML = `
                <div>
                    <strong>${producto.nombre}</strong>
                    <p>Cantidad: ${producto.cantidad}</p>
                </div>

                <div>
                    <strong>S/ ${Number(producto.precio).toFixed(2)}</strong>
                </div>
            `;

            detalleProductos.appendChild(div);
        });

        actualizarSeguimiento(pedido.estado);
        actualizarMapa(pedido.direccion);
    }

    function actualizarSeguimiento(estado) {
        const pasos = document.querySelectorAll(".paso-seguimiento");

        pasos.forEach((paso) => {
            paso.classList.remove("activo");
        });

        const ordenEstados = {
            pendiente: ["preparacion"],
            camino: ["preparacion", "camino"],
            reparto: ["preparacion", "camino", "reparto"],
            entregado: ["preparacion", "camino", "reparto", "entregado"]
        };

        const activos = ordenEstados[estado] || ["preparacion"];

        activos.forEach((pasoActivo) => {
            const paso = document.querySelector(`[data-paso="${pasoActivo}"]`);

            if (paso) {
                paso.classList.add("activo");
            }
        });
    }

    function actualizarMapa(direccion) {
        const ubicacion = encodeURIComponent(direccion || "Ica, Perú");
        mapaPedido.src = `https://www.google.com/maps?q=${ubicacion}&output=embed`;
    }

    function formatearEstado(estado) {
        const estados = {
            pendiente: "Pendiente",
            camino: "En camino",
            reparto: "En reparto",
            entregado: "Entregado"
        };

        return estados[estado] || estado;
    }

});