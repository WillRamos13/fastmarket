document.addEventListener("DOMContentLoaded", () => {

    const busqueda = document.getElementById("busqueda");
    const buscador = document.getElementById("buscador");

    const loginBtn = document.getElementById("login-btn");
    const clienteMenu = document.getElementById("cliente-menu");
    const btnCliente = document.getElementById("btn-cliente");
    const opcionesCliente = document.getElementById("opciones-cliente");
    const nombreCliente = document.getElementById("nombre-cliente");
    const cerrarSesionCliente = document.getElementById("cerrar-sesion-cliente");

    const mensajeLogin = document.getElementById("mensaje-login");
    const formCheckout = document.getElementById("form-checkout");
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const telefono = document.getElementById("telefono");
    const direccion = document.getElementById("direccion");
    const referencia = document.getElementById("referencia");
    const horario = document.getElementById("horario");
    const mensajeCheckout = document.getElementById("mensaje-checkout");

    const listaCheckout = document.getElementById("lista-checkout");
    const subtotalTexto = document.getElementById("subtotal");
    const envioTexto = document.getElementById("envio");
    const totalTexto = document.getElementById("total");

    let carrito = JSON.parse(localStorage.getItem("fashmarket_carrito")) || [];
    const costoEnvio = 8;

    iniciar();

    function iniciar() {
        activarBuscador();
        activarMenuCliente();
        cargarCliente();
        mostrarResumenCompra();
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

        document.addEventListener("click", () => {
            if (busqueda) busqueda.classList.remove("activo");
            if (opcionesCliente) opcionesCliente.classList.remove("activo");
        });
    }

    function activarMenuCliente() {
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

    function obtenerCliente() {
        return JSON.parse(localStorage.getItem("fashmarket_cliente"));
    }

    function cargarCliente() {
        const cliente = obtenerCliente();

        if (cliente) {
            loginBtn.classList.add("oculto");
            clienteMenu.classList.remove("oculto");
            nombreCliente.textContent = cliente.nombre || "Cliente";

            nombre.value = cliente.nombre || "";
            correo.value = cliente.correo || "";
            telefono.value = cliente.telefono || "";

            if (cliente.direcciones && cliente.direcciones.length > 0) {
                direccion.value = cliente.direcciones[0];
            }

            mensajeLogin.classList.add("oculto");
        } else {
            loginBtn.classList.remove("oculto");
            clienteMenu.classList.add("oculto");
            mensajeLogin.classList.remove("oculto");
        }
    }

    function mostrarResumenCompra() {
        listaCheckout.innerHTML = "";

        if (carrito.length === 0) {
            listaCheckout.innerHTML = `
                <div class="alerta">
                    <h3>Carrito vacío</h3>
                    <p>No tienes productos agregados al carrito.</p>
                    <a href="productos.html">Ir a productos</a>
                </div>
            `;

            subtotalTexto.textContent = "S/ 0.00";
            envioTexto.textContent = "S/ 0.00";
            totalTexto.textContent = "S/ 0.00";
            return;
        }

        let subtotal = 0;

        carrito.forEach((item) => {
            const totalItem = Number(item.precio) * Number(item.cantidad);
            subtotal += totalItem;

            const div = document.createElement("div");
            div.classList.add("item-checkout");

            div.innerHTML = `
                <div>
                    <h4>${item.nombre}</h4>
                    <p>Cantidad: ${item.cantidad}</p>
                </div>

                <strong>S/ ${totalItem.toFixed(2)}</strong>
            `;

            listaCheckout.appendChild(div);
        });

        const total = subtotal + costoEnvio;

        subtotalTexto.textContent = `S/ ${subtotal.toFixed(2)}`;
        envioTexto.textContent = `S/ ${costoEnvio.toFixed(2)}`;
        totalTexto.textContent = `S/ ${total.toFixed(2)}`;
    }

    formCheckout.addEventListener("submit", (e) => {
        e.preventDefault();

        const cliente = obtenerCliente();

        if (!cliente) {
            mostrarMensaje("Debes iniciar sesión para confirmar tu pedido.", "error");
            return;
        }

        if (carrito.length === 0) {
            mostrarMensaje("Tu carrito está vacío.", "error");
            return;
        }

        const nombreValor = nombre.value.trim();
        const correoValor = correo.value.trim().toLowerCase();
        const telefonoValor = telefono.value.trim();
        const direccionValor = direccion.value.trim();
        const referenciaValor = referencia.value.trim();
        const horarioValor = horario.value;
        const metodoPago = document.querySelector('input[name="pago"]:checked').value;

        if (
            nombreValor === "" ||
            correoValor === "" ||
            telefonoValor === "" ||
            direccionValor === ""
        ) {
            mostrarMensaje("Completa todos los datos obligatorios.", "error");
            return;
        }

        if (!validarCorreo(correoValor)) {
            mostrarMensaje("Ingresa un correo válido.", "error");
            return;
        }

        if (!validarTelefono(telefonoValor)) {
            mostrarMensaje("El teléfono debe tener 9 dígitos.", "error");
            return;
        }

        let subtotal = carrito.reduce((suma, item) => {
            return suma + Number(item.precio) * Number(item.cantidad);
        }, 0);

        const total = subtotal + costoEnvio;

        const nuevoPedido = {
            codigo: "P" + Date.now(),
            fecha: new Date().toISOString().slice(0, 10),
            estado: "pendiente",
            metodo: metodoPago,
            direccion: direccionValor,
            referencia: referenciaValor,
            horario: horarioValor,
            entregaEstimada: "Pendiente de confirmación",
            total: total,
            productos: carrito.map((item) => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precio
            }))
        };

        const clienteActualizado = {
            ...cliente,
            nombre: nombreValor,
            correo: correoValor,
            telefono: telefonoValor,
            direcciones: actualizarDirecciones(cliente.direcciones || [], direccionValor),
            pedidos: [...(cliente.pedidos || []), nuevoPedido]
        };

        localStorage.setItem("fashmarket_cliente", JSON.stringify(clienteActualizado));
        actualizarUsuarioRegistrado(clienteActualizado);
        localStorage.removeItem("fashmarket_carrito");

        mostrarMensaje("Pedido confirmado correctamente. Redirigiendo a Mis pedidos...", "ok");

        setTimeout(() => {
            window.location.href = "pedidos.html";
        }, 1200);
    });

    function actualizarDirecciones(direcciones, direccionNueva) {
        if (!direcciones.includes(direccionNueva)) {
            direcciones.push(direccionNueva);
        }

        return direcciones;
    }

    function actualizarUsuarioRegistrado(clienteActualizado) {
        let usuarios = JSON.parse(localStorage.getItem("fashmarket_usuarios_clientes")) || [];

        usuarios = usuarios.map((usuario) => {
            if (usuario.id === clienteActualizado.id || usuario.correo === clienteActualizado.correo) {
                return {
                    ...usuario,
                    nombre: clienteActualizado.nombre,
                    correo: clienteActualizado.correo,
                    telefono: clienteActualizado.telefono,
                    direcciones: clienteActualizado.direcciones,
                    pedidos: clienteActualizado.pedidos
                };
            }

            return usuario;
        });

        localStorage.setItem("fashmarket_usuarios_clientes", JSON.stringify(usuarios));
    }

    function validarCorreo(valor) {
        return valor.includes("@") && valor.includes(".");
    }

    function validarTelefono(valor) {
        return /^[0-9]{9}$/.test(valor);
    }

    function mostrarMensaje(texto, tipo) {
        mensajeCheckout.textContent = texto;

        if (tipo === "ok") {
            mensajeCheckout.style.color = "#16a34a";
        } else {
            mensajeCheckout.style.color = "#dc2626";
        }
    }

});