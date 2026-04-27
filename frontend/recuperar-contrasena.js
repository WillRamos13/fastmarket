const formRecuperar = document.getElementById("form-recuperar");
const correo = document.getElementById("correo");
const nuevaPassword = document.getElementById("nueva-password");
const confirmarPassword = document.getElementById("confirmar-password");
const mensajeRecuperar = document.getElementById("mensaje-recuperar");

formRecuperar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correoValor = correo.value.trim().toLowerCase();
    const nuevaValor = nuevaPassword.value.trim();
    const confirmarValor = confirmarPassword.value.trim();

    if (correoValor === "" || nuevaValor === "" || confirmarValor === "") {
        mostrarMensaje("Completa todos los campos.", "error");
        return;
    }

    if (!correoValor.includes("@") || !correoValor.includes(".")) {
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

    try {
        await FastMarket.request("/auth/recuperar", {
            method: "POST",
            body: {
                correo: correoValor,
                passwordNueva: nuevaValor
            }
        });

        FastMarket.cerrarSesion();
        mostrarMensaje("Contraseña actualizada correctamente. Vuelve a iniciar sesión.", "ok");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
});

function mostrarMensaje(texto, tipo) {
    mensajeRecuperar.textContent = texto;
    mensajeRecuperar.style.color = tipo === "ok" ? "#16a34a" : "#dc2626";
}
