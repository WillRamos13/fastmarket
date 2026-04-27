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
    const btnCerrarLateral = document.getElementById("btn-cerrar-lateral");

    const resumenNombre = document.getElementById("resumen-nombre");
    const resumenCorreo = document.getElementById("resumen-correo");
    const resumenDirecciones = document.getElementById("resumen-direcciones");
    const resumenPedidos = document.getElementById("resumen-pedidos");

    const mensajeSinSesion = document.getElementById("mensaje-sin-sesion");
    const formPerfil = document.getElementById("form-perfil");
    const perfilNombre = document.getElementById("perfil-nombre");
    const perfilCorreo = document.getElementById("perfil-correo");
    const perfilTelefono = document.getElementById("perfil-telefono");
    const mensajePerfil = document.getElementById("mensaje-perfil");

    const formDireccion = document.getElementById("form-direccion");
    const nuevaDireccion = document.getElementById("nueva-direccion");
    const mensajeDireccion = document.getElementById("mensaje-direccion");
    const listaDirecciones = document.getElementById("lista-direcciones");

    const formPassword = document.getElementById("form-password");
    const passwordActual = document.getElementById("password-actual");
    const passwordNueva = document.getElementById("password-nueva");
    const passwordConfirmar = document.getElementById("password-confirmar");
    const mensajePassword = document.getElementById("mensaje-password");

    iniciarPerfil();

    if (btnCliente && opcionesCliente) {
        btnCliente.addEventListener("click", (e) => {
            e.stopPropagation();
            opcionesCliente.classList.toggle("activo");
        });

        opcionesCliente.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    document.addEventListener("click", () => {
        if (busqueda) {
            busqueda.classList.remove("activo");
        }

        if (opcionesCliente) {
            opcionesCliente.classList.remove("activo");
        }
    });

    if (cerrarSesionCliente) {
        cerrarSesionCliente.addEventListener("click", cerrarSesion);
    }

    if (btnCerrarLateral) {
        btnCerrarLateral.addEventListener("click", cerrarSesion);
    }

    if (formPerfil) {
        formPerfil.addEventListener("submit", guardarPerfil);
    }

    if (formDireccion) {
        formDireccion.addEventListener("submit", agregarDireccion);
    }

    if (formPassword) {
        formPassword.addEventListener("submit", cambiarPassword);
    }

    function obtenerCliente() {
        return JSON.parse(localStorage.getItem("fashmarket_cliente"));
    }

    function obtenerUsuarios() {
        return JSON.parse(localStorage.getItem("fashmarket_usuarios_clientes")) || [];
    }

    function guardarUsuarios(usuarios) {
        localStorage.setItem("fashmarket_usuarios_clientes", JSON.stringify(usuarios));
    }

    function iniciarPerfil() {
        actualizarVistaCliente();
        cargarDatosPerfil();
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

    function cargarDatosPerfil() {
        const cliente = obtenerCliente();

        if (!cliente) {
            mostrarVistaSinSesion();
            return;
        }

        mensajeSinSesion.classList.add("oculto");

        resumenNombre.textContent = cliente.nombre || "---";
        resumenCorreo.textContent = cliente.correo || "---";
        resumenDirecciones.textContent = cliente.direcciones ? cliente.direcciones.length : 0;
        resumenPedidos.textContent = cliente.pedidos ? cliente.pedidos.length : 0;

        perfilNombre.value = cliente.nombre || "";
        perfilCorreo.value = cliente.correo || "";
        perfilTelefono.value = cliente.telefono || "";

        mostrarDirecciones();
    }

    function mostrarVistaSinSesion() {
        mensajeSinSesion.classList.remove("oculto");

        resumenNombre.textContent = "---";
        resumenCorreo.textContent = "---";
        resumenDirecciones.textContent = "0";
        resumenPedidos.textContent = "0";

        formPerfil.style.display = "none";
        formDireccion.style.display = "none";
        formPassword.style.display = "none";
        listaDirecciones.innerHTML = "";
    }

    function guardarPerfil(e) {
        e.preventDefault();

        let cliente = obtenerCliente();

        if (!cliente) {
            mostrarMensaje(mensajePerfil, "Debes iniciar sesión.", "error");
            return;
        }

        const nombre = perfilNombre.value.trim();
        const correo = perfilCorreo.value.trim().toLowerCase();
        const telefono = perfilTelefono.value.trim();

        if (nombre === "" || correo === "" || telefono === "") {
            mostrarMensaje(mensajePerfil, "Completa todos los campos.", "error");
            return;
        }

        if (!validarCorreo(correo)) {
            mostrarMensaje(mensajePerfil, "Ingresa un correo válido.", "error");
            return;
        }

        if (!validarTelefono(telefono)) {
            mostrarMensaje(mensajePerfil, "El teléfono debe tener 9 dígitos.", "error");
            return;
        }

        let usuarios = obtenerUsuarios();

        const correoUsado = usuarios.some((usuario) => {
            return usuario.correo === correo && usuario.id !== cliente.id;
        });

        if (correoUsado) {
            mostrarMensaje(mensajePerfil, "Ese correo ya pertenece a otro usuario.", "error");
            return;
        }

        usuarios = usuarios.map((usuario) => {
            if (usuario.id === cliente.id || usuario.correo === cliente.correo) {
                return {
                    ...usuario,
                    nombre: nombre,
                    correo: correo,
                    telefono: telefono
                };
            }

            return usuario;
        });

        cliente = {
            ...cliente,
            nombre: nombre,
            correo: correo,
            telefono: telefono
        };

        guardarUsuarios(usuarios);
        localStorage.setItem("fashmarket_cliente", JSON.stringify(cliente));

        mostrarMensaje(mensajePerfil, "Datos actualizados correctamente.", "ok");
        actualizarVistaCliente();
        cargarDatosPerfil();
    }

    function mostrarDirecciones() {
        const cliente = obtenerCliente();

        if (!cliente) return;

        const direcciones = cliente.direcciones || [];

        listaDirecciones.innerHTML = "";

        if (direcciones.length === 0) {
            listaDirecciones.innerHTML = `
                <div class="direccion-item">
                    <p>No tienes direcciones guardadas.</p>
                </div>
            `;
            return;
        }

        direcciones.forEach((direccion, index) => {
            const div = document.createElement("div");
            div.classList.add("direccion-item");

            div.innerHTML = `
                <p>${direccion}</p>
                <button data-index="${index}">Eliminar</button>
            `;

            const btnEliminar = div.querySelector("button");

            btnEliminar.addEventListener("click", () => {
                eliminarDireccion(index);
            });

            listaDirecciones.appendChild(div);
        });
    }

    function agregarDireccion(e) {
        e.preventDefault();

        let cliente = obtenerCliente();

        if (!cliente) {
            mostrarMensaje(mensajeDireccion, "Debes iniciar sesión.", "error");
            return;
        }

        const direccion = nuevaDireccion.value.trim();

        if (direccion === "") {
            mostrarMensaje(mensajeDireccion, "Ingresa una dirección.", "error");
            return;
        }

        if (!cliente.direcciones) {
            cliente.direcciones = [];
        }

        cliente.direcciones.push(direccion);

        actualizarClienteEnStorage(cliente);

        nuevaDireccion.value = "";
        mostrarMensaje(mensajeDireccion, "Dirección agregada correctamente.", "ok");
        cargarDatosPerfil();
    }

    function eliminarDireccion(index) {
        let cliente = obtenerCliente();

        if (!cliente || !cliente.direcciones) return;

        cliente.direcciones.splice(index, 1);

        actualizarClienteEnStorage(cliente);
        cargarDatosPerfil();
    }

    function cambiarPassword(e) {
        e.preventDefault();

        const cliente = obtenerCliente();

        if (!cliente) {
            mostrarMensaje(mensajePassword, "Debes iniciar sesión.", "error");
            return;
        }

        const actual = passwordActual.value.trim();
        const nueva = passwordNueva.value.trim();
        const confirmar = passwordConfirmar.value.trim();

        if (actual === "" || nueva === "" || confirmar === "") {
            mostrarMensaje(mensajePassword, "Completa todos los campos.", "error");
            return;
        }

        if (nueva.length < 6) {
            mostrarMensaje(mensajePassword, "La nueva contraseña debe tener mínimo 6 caracteres.", "error");
            return;
        }

        if (nueva !== confirmar) {
            mostrarMensaje(mensajePassword, "Las contraseñas no coinciden.", "error");
            return;
        }

        let usuarios = obtenerUsuarios();

        const usuario = usuarios.find((item) => {
            return item.id === cliente.id || item.correo === cliente.correo;
        });

        if (!usuario) {
            mostrarMensaje(mensajePassword, "No se encontró tu usuario registrado.", "error");
            return;
        }

        if (usuario.password !== actual) {
            mostrarMensaje(mensajePassword, "La contraseña actual es incorrecta.", "error");
            return;
        }

        usuarios = usuarios.map((item) => {
            if (item.id === usuario.id) {
                return {
                    ...item,
                    password: nueva
                };
            }

            return item;
        });

        guardarUsuarios(usuarios);

        passwordActual.value = "";
        passwordNueva.value = "";
        passwordConfirmar.value = "";

        mostrarMensaje(mensajePassword, "Contraseña actualizada correctamente.", "ok");
    }

    function actualizarClienteEnStorage(clienteActualizado) {
        localStorage.setItem("fashmarket_cliente", JSON.stringify(clienteActualizado));

        let usuarios = obtenerUsuarios();

        usuarios = usuarios.map((usuario) => {
            if (usuario.id === clienteActualizado.id || usuario.correo === clienteActualizado.correo) {
                return {
                    ...usuario,
                    nombre: clienteActualizado.nombre,
                    correo: clienteActualizado.correo,
                    telefono: clienteActualizado.telefono,
                    direcciones: clienteActualizado.direcciones || [],
                    pedidos: clienteActualizado.pedidos || []
                };
            }

            return usuario;
        });

        guardarUsuarios(usuarios);
    }

    function cerrarSesion() {
        localStorage.removeItem("fashmarket_cliente");
        window.location.href = "login.html";
    }

    function validarCorreo(correo) {
        return correo.includes("@") && correo.includes(".");
    }

    function validarTelefono(telefono) {
        return /^[0-9]{9}$/.test(telefono);
    }

    function mostrarMensaje(elemento, texto, tipo) {
        elemento.textContent = texto;

        if (tipo === "ok") {
            elemento.style.color = "#16a34a";
        } else {
            elemento.style.color = "#dc2626";
        }
    }

    /* CHAT */

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
        if (!input || !contenedorMensajes) return;

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

            if (data.respuesta) {
                agregarMensaje(data.respuesta, "bot");
            } else {
                agregarMensaje("No recibí respuesta de la IA.", "bot");
            }

        } catch (error) {
            eliminarUltimoMensaje();
            agregarMensaje("Error al conectar con la IA.", "bot");
            console.error("Error real:", error);
        }
    }

    function agregarMensaje(texto, clase) {
        if (!contenedorMensajes) return;

        const div = document.createElement("div");
        div.classList.add("mensaje-chat", clase);
        div.textContent = texto;

        contenedorMensajes.appendChild(div);
        contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
    }

    function eliminarUltimoMensaje() {
        if (contenedorMensajes && contenedorMensajes.lastChild) {
            contenedorMensajes.removeChild(contenedorMensajes.lastChild);
        }
    }

});