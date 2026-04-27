const formRecuperar = document.getElementById("form-recuperar");
const correo = document.getElementById("correo");
const nuevaPassword = document.getElementById("nueva-password");
const confirmarPassword = document.getElementById("confirmar-password");
const mensajeRecuperar = document.getElementById("mensaje-recuperar");

formRecuperar.addEventListener("submit", (e) => {
    e.preventDefault();

    const correoValor = correo.value.trim().toLowerCase();
    const nuevaValor = nuevaPassword.value.trim();
    const confirmarValor = confirmarPassword.value.trim();

    if (correoValor === "" || nuevaValor === "" || confirmarValor === "") {
        mostrarMensaje("Completa todos los campos.", "error");
        return;
    }

    if (!validarCorreo(correoValor)) {
        mostrarMensaje("Ingresa un correo válido.", "error");
        return;
    }

    if (nuevaValor.length < 6) {
        mostrarMensaje("La contraseña debe tener mínimo 6 caracteres.", "error");
        return;
    }

    if (nuevaValor !== confirmarValor) {
        mostrarMensaje("Las contraseñas no coinciden.", "error");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("fashmarket_usuarios_clientes")) || [];

    const usuarioEncontrado = usuarios.find((usuario) => usuario.correo === correoValor);

    if (!usuarioEncontrado) {
        mostrarMensaje("No existe una cuenta registrada con ese correo.", "error");
        return;
    }

    usuarios = usuarios.map((usuario) => {
        if (usuario.correo === correoValor) {
            return {
                ...usuario,
                password: nuevaValor
            };
        }

        return usuario;
    });

    localStorage.setItem("fashmarket_usuarios_clientes", JSON.stringify(usuarios));

    const clienteActual = JSON.parse(localStorage.getItem("fashmarket_cliente"));

    if (clienteActual && clienteActual.correo === correoValor) {
        localStorage.removeItem("fashmarket_cliente");
    }

    mostrarMensaje("Contraseña actualizada correctamente. Vuelve a iniciar sesión.", "ok");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
});

function validarCorreo(correo) {
    return correo.includes("@") && correo.includes(".");
}

function mostrarMensaje(texto, tipo) {
    mensajeRecuperar.textContent = texto;

    if (tipo === "ok") {
        mensajeRecuperar.style.color = "#16a34a";
    } else {
        mensajeRecuperar.style.color = "#dc2626";
    }
}