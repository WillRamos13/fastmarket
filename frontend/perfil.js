document.addEventListener("DOMContentLoaded", async () => {
    FastMarket.activarBuscador("buscador", "busqueda");
    FastMarket.activarMenuCliente();
    FastMarket.activarChatBasico();

    const usuario = FastMarket.requireCliente(false);
    if (!usuario) {
        document.getElementById("mensaje-sin-sesion")?.classList.remove("oculto");
        return;
    }

    await refrescarUsuario(usuario.id);
    activarEventos();
});

let usuarioActual = null;
let pedidosUsuario = [];

async function refrescarUsuario(id) {
    try {
        usuarioActual = await FastMarket.request(`/usuarios/${id}`, { auth: true });
        FastMarket.actualizarUsuario(usuarioActual);
        try {
            pedidosUsuario = await FastMarket.request(`/pedidos/usuario/${id}`, { auth: true });
        } catch {
            pedidosUsuario = [];
        }
        pintarPerfil();
    } catch (error) {
        mostrarMensaje("mensaje-perfil", error.message);
    }
}

function activarEventos() {
    document.getElementById("cerrar-sesion-cliente")?.addEventListener("click", cerrarSesion);
    document.getElementById("btn-cerrar-lateral")?.addEventListener("click", cerrarSesion);
    document.getElementById("form-perfil")?.addEventListener("submit", guardarPerfil);
    document.getElementById("form-direccion")?.addEventListener("submit", agregarDireccion);
    document.getElementById("form-password")?.addEventListener("submit", cambiarPassword);
}

function pintarPerfil() {
    if (!usuarioActual) return;

    setText("resumen-nombre", usuarioActual.nombre);
    setText("resumen-correo", usuarioActual.correo);
    setText("resumen-direcciones", (usuarioActual.direcciones || []).length);
    setText("resumen-pedidos", pedidosUsuario.length);

    const mensajeSinSesion = document.getElementById("mensaje-sin-sesion");
    if (mensajeSinSesion) mensajeSinSesion.classList.add("oculto");

    const nombre = document.getElementById("perfil-nombre");
    const correo = document.getElementById("perfil-correo");
    const telefono = document.getElementById("perfil-telefono");

    if (nombre) nombre.value = usuarioActual.nombre || "";
    if (correo) {
        correo.value = usuarioActual.correo || "";
        correo.disabled = true;
    }
    if (telefono) telefono.value = usuarioActual.telefono || "";

    pintarDirecciones();
}

function pintarDirecciones() {
    const lista = document.getElementById("lista-direcciones");
    if (!lista) return;

    const direcciones = usuarioActual?.direcciones || [];

    if (direcciones.length === 0) {
        lista.innerHTML = `<p>No tienes direcciones registradas.</p>`;
        return;
    }

    lista.innerHTML = direcciones.map((d, i) => `
        <div class="direccion-item">
            <h4>Dirección ${i + 1} ${d.principal ? "(principal)" : ""}</h4>
            <p>${FastMarket.escapeHTML(d.direccion)}</p>
            <small>${FastMarket.escapeHTML([d.referencia, d.distrito, d.ciudad].filter(Boolean).join(" - "))}</small>
        </div>
    `).join("");
}

async function guardarPerfil(e) {
    e.preventDefault();
    if (!usuarioActual) return;

    const nombre = document.getElementById("perfil-nombre").value.trim();
    const telefono = document.getElementById("perfil-telefono").value.trim();

    if (!nombre) {
        mostrarMensaje("mensaje-perfil", "El nombre es obligatorio.");
        return;
    }

    try {
        usuarioActual = await FastMarket.request(`/usuarios/${usuarioActual.id}`, {
            method: "PUT",
            auth: true,
            body: {
                nombre,
                telefono,
                documento: usuarioActual.documento
            }
        });
        FastMarket.actualizarUsuario(usuarioActual);
        pintarPerfil();
        FastMarket.activarMenuCliente();
        mostrarMensaje("mensaje-perfil", "Perfil actualizado correctamente.");
    } catch (error) {
        mostrarMensaje("mensaje-perfil", error.message);
    }
}

async function agregarDireccion(e) {
    e.preventDefault();
    if (!usuarioActual) return;

    const input = document.getElementById("nueva-direccion");
    const valor = input.value.trim();

    if (!valor) {
        mostrarMensaje("mensaje-direccion", "Escribe una dirección.");
        return;
    }

    try {
        usuarioActual = await FastMarket.request(`/usuarios/${usuarioActual.id}/direcciones`, {
            method: "POST",
            auth: true,
            body: {
                direccion: valor,
                referencia: "",
                distrito: "Ica",
                ciudad: "Ica",
                principal: (usuarioActual.direcciones || []).length === 0
            }
        });
        FastMarket.actualizarUsuario(usuarioActual);
        input.value = "";
        pintarPerfil();
        mostrarMensaje("mensaje-direccion", "Dirección agregada correctamente.");
    } catch (error) {
        mostrarMensaje("mensaje-direccion", error.message);
    }
}

async function cambiarPassword(e) {
    e.preventDefault();
    if (!usuarioActual) return;

    const actual = document.getElementById("password-actual");
    const nueva = document.getElementById("password-nueva");
    const confirmar = document.getElementById("password-confirmar");

    if (!actual.value || !nueva.value || !confirmar.value) {
        mostrarMensaje("mensaje-password", "Completa todos los campos.");
        return;
    }

    if (nueva.value.length < 6) {
        mostrarMensaje("mensaje-password", "La nueva contraseña debe tener mínimo 6 caracteres.");
        return;
    }

    if (nueva.value !== confirmar.value) {
        mostrarMensaje("mensaje-password", "Las contraseñas no coinciden.");
        return;
    }

    try {
        await FastMarket.request(`/usuarios/${usuarioActual.id}/password`, {
            method: "PUT",
            auth: true,
            body: {
                passwordActual: actual.value,
                passwordNueva: nueva.value
            }
        });

        actual.value = "";
        nueva.value = "";
        confirmar.value = "";
        mostrarMensaje("mensaje-password", "Contraseña actualizada correctamente.");
    } catch (error) {
        mostrarMensaje("mensaje-password", error.message);
    }
}

function cerrarSesion() {
    FastMarket.cerrarSesion();
    window.location.href = "login.html";
}

function mostrarMensaje(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

function setText(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto || "---";
}
