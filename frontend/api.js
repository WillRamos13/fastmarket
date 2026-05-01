const FastMarket = (() => {
    const API_URL = (() => {
        const normalizar = (url) => {
            const limpia = String(url || "").trim().replace(/\/+$/, "");
            if (!limpia) return "";
            return limpia.endsWith("/api") ? limpia : `${limpia}/api`;
        };

        const desdeWindow = normalizar(window.FASTMARKET_API_URL);
        if (desdeWindow) return desdeWindow;

        const meta = document.querySelector('meta[name="fastmarket-api-url"]');
        const desdeMeta = normalizar(meta?.content);
        if (desdeMeta) return desdeMeta;

        try {
            const desdeLocalStorage = normalizar(localStorage.getItem("fashmarket_api_url"));
            if (desdeLocalStorage) return desdeLocalStorage;
        } catch {
            // Si el navegador bloquea localStorage, se usa el valor por defecto.
        }

        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") {
            return "http://localhost:8080/api";
        }

        // Cambia esta URL si tu servicio backend de Render tiene otro nombre.
        return "https://fastmarket-573w.onrender.com/api";
    })();

    function getSesion() {
        return JSON.parse(localStorage.getItem("fashmarket_sesion")) || null;
    }

    function getCliente() {
        const sesion = getSesion();
        return sesion?.usuario || JSON.parse(localStorage.getItem("fashmarket_cliente")) || null;
    }

    function getToken() {
        return getSesion()?.token || localStorage.getItem("fashmarket_token") || "";
    }

    function guardarSesion(authResponse) {
        const usuario = authResponse.usuario || authResponse;
        const token = authResponse.token || "";
        localStorage.setItem("fashmarket_sesion", JSON.stringify({ usuario, token }));
        localStorage.setItem("fashmarket_cliente", JSON.stringify(usuario));

        if (usuario.rol === "ADMIN") {
            localStorage.setItem("fashmarket_admin", JSON.stringify(usuario));
        } else {
            localStorage.removeItem("fashmarket_admin");
        }

        if (token) localStorage.setItem("fashmarket_token", token);
        return usuario;
    }

    function actualizarUsuario(usuario) {
        const sesion = getSesion() || {};
        localStorage.setItem("fashmarket_sesion", JSON.stringify({ usuario, token: sesion.token || getToken() }));
        localStorage.setItem("fashmarket_cliente", JSON.stringify(usuario));
        if (usuario.rol === "ADMIN") localStorage.setItem("fashmarket_admin", JSON.stringify(usuario));
    }

    function cerrarSesion() {
        localStorage.removeItem("fashmarket_sesion");
        localStorage.removeItem("fashmarket_cliente");
        localStorage.removeItem("fashmarket_admin");
        localStorage.removeItem("fashmarket_token");
    }

    function headers(auth = false) {
        const h = { "Content-Type": "application/json" };
        if (auth) {
            const token = getToken();
            if (token) h.Authorization = `Bearer ${token}`;
        }
        return h;
    }

    async function request(path, options = {}) {
        const { method = "GET", body = null, auth = false, raw = false } = options;

        const config = { method, headers: headers(auth) };
        if (body !== null && body !== undefined) config.body = JSON.stringify(body);

        let res;
        try {
            res = await fetch(`${API_URL}${path}`, config);
        } catch (error) {
            throw new Error(`No se pudo conectar con el backend. Revisa que api.js apunte a tu URL real y que CORS permita tu frontend. API actual: ${API_URL}`);
        }

        const text = await res.text();
        let data = null;

        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = text;
        }

        if (!res.ok) {
            const mensaje = data?.error || data?.detalle || "Error al conectar con el backend";
            throw new Error(mensaje);
        }

        return raw ? { res, data } : data;
    }

    function requireCliente(redirect = true) {
        const usuario = getCliente();
        if (!usuario && redirect) window.location.href = "login.html";
        return usuario;
    }

    function requireAdmin(redirect = true) {
        const usuario = getCliente();
        if (!usuario || usuario.rol !== "ADMIN") {
            if (redirect) window.location.href = "login.html";
            return null;
        }
        return usuario;
    }

    function money(value) {
        return `S/ ${Number(value || 0).toFixed(2)}`;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizarEstado(estado) {
        return String(estado || "PENDIENTE").toUpperCase();
    }

    function estadoTexto(estado) {
        const estados = {
            PENDIENTE: "Pendiente",
            CONFIRMADO: "Confirmado",
            PREPARANDO: "Preparando",
            CAMINO: "En camino",
            ENTREGADO: "Entregado",
            CANCELADO: "Cancelado"
        };
        return estados[normalizarEstado(estado)] || estado;
    }

    function irBusqueda(texto) {
        const q = String(texto || "").trim();
        if (q) window.location.href = `productos.html?q=${encodeURIComponent(q)}`;
    }

    function activarBuscador(inputId = "buscador", contenedorId = "busqueda") {
        const contenedor = document.getElementById(contenedorId);
        const input = document.getElementById(inputId);

        if (contenedor) {
            contenedor.addEventListener("click", (e) => {
                e.stopPropagation();
                contenedor.classList.toggle("activo");
                if (input) input.focus();
            });
        }

        if (input) {
            input.addEventListener("click", (e) => e.stopPropagation());
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    irBusqueda(input.value);
                    input.value = "";
                }
            });
        }

        document.addEventListener("click", () => {
            if (contenedor) contenedor.classList.remove("activo");
            const opcionesCliente = document.getElementById("opciones-cliente");
            if (opcionesCliente) opcionesCliente.classList.remove("activo");
        });
    }

    function activarMenuCliente() {
        const loginBtn = document.getElementById("login-btn");
        const clienteMenu = document.getElementById("cliente-menu");
        const btnCliente = document.getElementById("btn-cliente");
        const opcionesCliente = document.getElementById("opciones-cliente");
        const nombreCliente = document.getElementById("nombre-cliente");
        const cerrar = document.getElementById("cerrar-sesion-cliente");

        const usuario = getCliente();

        if (loginBtn && clienteMenu && nombreCliente) {
            if (usuario) {
                loginBtn.classList.add("oculto");
                clienteMenu.classList.remove("oculto");
                nombreCliente.textContent = usuario.nombre || "Cliente";
            } else {
                loginBtn.classList.remove("oculto");
                clienteMenu.classList.add("oculto");
                nombreCliente.textContent = "Cliente";
            }
        }

        if (btnCliente && opcionesCliente && !btnCliente.dataset.fmMenu) {
            btnCliente.dataset.fmMenu = "true";
            btnCliente.addEventListener("click", (e) => {
                e.stopPropagation();
                opcionesCliente.classList.toggle("activo");
            });
            opcionesCliente.addEventListener("click", (e) => e.stopPropagation());
        }

        if (cerrar && !cerrar.dataset.fmLogout) {
            cerrar.dataset.fmLogout = "true";
            cerrar.addEventListener("click", () => {
                cerrarSesion();
                window.location.href = "login.html";
            });
        }
    }

    function mostrarPanelCliente() {
        const overlay = document.getElementById("overlay-cliente");
        const panel = document.getElementById("panel-cliente");
        const cerrar = document.getElementById("cerrar-panel-cliente");
        const titulo = document.getElementById("titulo-panel-cliente");
        const contenido = document.getElementById("contenido-panel-cliente");
        if (!overlay || !panel || !titulo || !contenido) return;

        const cerrarPanel = () => {
            overlay.classList.remove("activo");
            panel.classList.remove("activo");
        };

        if (cerrar && !cerrar.dataset.fmCerrar) {
            cerrar.dataset.fmCerrar = "true";
            cerrar.addEventListener("click", cerrarPanel);
            overlay.addEventListener("click", cerrarPanel);
        }

        document.querySelectorAll("[data-cliente-panel]").forEach((boton) => {
            if (boton.dataset.fmPanel) return;
            boton.dataset.fmPanel = "true";
            boton.addEventListener("click", async () => {
                const usuario = requireCliente(true);
                if (!usuario) return;

                panel.classList.add("activo");
                overlay.classList.add("activo");

                if (boton.dataset.clientePanel === "perfil") {
                    titulo.textContent = "Mi perfil";
                    contenido.innerHTML = `
                        <div class="info-cliente-card">
                            <h3>Datos personales</h3>
                            <p><strong>Nombre:</strong> ${escapeHTML(usuario.nombre)}</p>
                            <p><strong>Correo:</strong> ${escapeHTML(usuario.correo)}</p>
                            <p><strong>Teléfono:</strong> ${escapeHTML(usuario.telefono || "No registrado")}</p>
                            <a href="perfil.html">Editar perfil</a>
                        </div>`;
                }

                if (boton.dataset.clientePanel === "direcciones") {
                    titulo.textContent = "Direcciones";
                    const direcciones = usuario.direcciones || [];
                    contenido.innerHTML = direcciones.length
                        ? direcciones.map((d, i) => `
                            <div class="info-cliente-card">
                                <h3>Dirección ${i + 1}</h3>
                                <p>${escapeHTML(d.direccion || d)}</p>
                                <small>${escapeHTML(d.referencia || "")}</small>
                            </div>`).join("")
                        : `<div class="info-cliente-card"><h3>Sin direcciones</h3><p>Puedes agregarlas desde tu perfil.</p><a href="perfil.html#direcciones">Agregar dirección</a></div>`;
                }

                if (boton.dataset.clientePanel === "seguridad") {
                    titulo.textContent = "Seguridad";
                    contenido.innerHTML = `<div class="info-cliente-card"><h3>Sesión activa</h3><p>Tu cuenta está iniciada en este navegador.</p></div>`;
                }
            });
        });
    }

    function activarChatBasico() {
        const boton = document.getElementById("chat-soporte");
        const chatBox = document.getElementById("chat-box");
        const cerrar = document.getElementById("cerrar-chat");
        const enviar = document.getElementById("enviar");
        const input = document.getElementById("mensaje");
        const mensajes = document.getElementById("chat-mensajes");
        if (!boton || !chatBox || !input || !mensajes) return;

        if (boton.dataset.fmChatActivo) return;
        boton.dataset.fmChatActivo = "true";

        boton.addEventListener("click", () => {
            chatBox.style.display = "flex";
            if (!mensajes.dataset.fmBienvenida) {
                agregar("bot", "Hola 👋 Soy el asistente de FashMarket. Puedo ayudarte con productos, ofertas, stock, pedidos, envíos y pagos.");
                mensajes.dataset.fmBienvenida = "true";
            }
            input.focus();
        });

        if (cerrar) cerrar.addEventListener("click", () => chatBox.style.display = "none");

        const agregar = (tipo, texto) => {
            const div = document.createElement("div");
            div.className = tipo === "user" ? "mensaje usuario" : "mensaje bot";

            const contenido = document.createElement("div");
            contenido.className = "mensaje-contenido";
            contenido.textContent = texto;

            div.appendChild(contenido);
            mensajes.appendChild(div);
            mensajes.scrollTop = mensajes.scrollHeight;
            return div;
        };

        const cambiarTextoMensaje = (mensaje, texto) => {
            if (!mensaje) return;
            const contenido = mensaje.querySelector(".mensaje-contenido");
            if (contenido) contenido.textContent = texto;
            else mensaje.textContent = texto;
            mensajes.scrollTop = mensajes.scrollHeight;
        };

        const responder = async () => {
            const texto = input.value.trim();
            if (!texto) return;

            agregar("user", texto);
            input.value = "";
            input.disabled = true;
            if (enviar) enviar.disabled = true;

            const mensajeCarga = agregar("bot", "Escribiendo...");

            try {
                const data = await request("/chat", {
                    method: "POST",
                    body: { mensaje: texto },
                    auth: true
                });

                cambiarTextoMensaje(mensajeCarga, data?.respuesta || "No recibí respuesta del asistente.");
            } catch (error) {
                cambiarTextoMensaje(
                    mensajeCarga,
                    error?.message || "No pude conectarme con el asistente. Revisa el backend o la configuración de la IA."
                );
            } finally {
                input.disabled = false;
                if (enviar) enviar.disabled = false;
                input.focus();
            }
        };

        if (enviar) enviar.addEventListener("click", responder);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") responder();
        });
    }

    return {
        API_URL,
        getSesion,
        getCliente,
        getToken,
        guardarSesion,
        actualizarUsuario,
        cerrarSesion,
        request,
        requireCliente,
        requireAdmin,
        money,
        escapeHTML,
        normalizarEstado,
        estadoTexto,
        irBusqueda,
        activarBuscador,
        activarMenuCliente,
        mostrarPanelCliente,
        activarChatBasico
    };
})();
