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

    actualizarVistaCliente();

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
        div.classList.add("mensaje", clase);
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