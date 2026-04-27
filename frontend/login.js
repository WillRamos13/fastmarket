document.addEventListener("DOMContentLoaded", () => {
    const tabLogin = document.getElementById("tab-login");
    const tabRegistro = document.getElementById("tab-registro");
    const formLogin = document.getElementById("form-login");
    const formRegistro = document.getElementById("form-registro");
    const irRegistro = document.getElementById("ir-registro");
    const irLogin = document.getElementById("ir-login");

    const loginCorreo = document.getElementById("login-correo");
    const loginPassword = document.getElementById("login-password");
    const mensajeLogin = document.getElementById("mensaje-login");

    const registroNombre = document.getElementById("registro-nombre");
    const registroCorreo = document.getElementById("registro-correo");
    const registroTelefono = document.getElementById("registro-telefono");
    const registroDireccion = document.getElementById("registro-direccion");
    const registroPassword = document.getElementById("registro-password");
    const registroConfirmar = document.getElementById("registro-confirmar");
    const mensajeRegistro = document.getElementById("mensaje-registro");

    function mostrarLogin() {
        tabLogin.classList.add("activo");
        tabRegistro.classList.remove("activo");
        formLogin.classList.add("activo-form");
        formRegistro.classList.remove("activo-form");
    }

    function mostrarRegistro() {
        tabRegistro.classList.add("activo");
        tabLogin.classList.remove("activo");
        formRegistro.classList.add("activo-form");
        formLogin.classList.remove("activo-form");
    }

    tabLogin.addEventListener("click", mostrarLogin);
    tabRegistro.addEventListener("click", mostrarRegistro);
    irLogin.addEventListener("click", mostrarLogin);
    irRegistro.addEventListener("click", mostrarRegistro);

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensajeLogin.textContent = "";

        const correo = loginCorreo.value.trim();
        const password = loginPassword.value.trim();

        if (!correo || !password) {
            mensajeLogin.textContent = "Completa correo y contraseña.";
            return;
        }

        try {
            const respuesta = await FastMarket.request("/auth/login", {
                method: "POST",
                body: { correo, password }
            });

            const usuario = FastMarket.guardarSesion(respuesta);
            mensajeLogin.textContent = "Inicio de sesión correcto.";

            if (usuario.rol === "ADMIN") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "productos.html";
            }
        } catch (error) {
            mensajeLogin.textContent = error.message;
        }
    });

    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensajeRegistro.textContent = "";

        const nombre = registroNombre.value.trim();
        const correo = registroCorreo.value.trim();
        const telefono = registroTelefono.value.trim();
        const direccion = registroDireccion.value.trim();
        const password = registroPassword.value.trim();
        const confirmar = registroConfirmar.value.trim();

        if (!nombre || !correo || !password) {
            mensajeRegistro.textContent = "Completa nombre, correo y contraseña.";
            return;
        }

        if (password.length < 6) {
            mensajeRegistro.textContent = "La contraseña debe tener mínimo 6 caracteres.";
            return;
        }

        if (password !== confirmar) {
            mensajeRegistro.textContent = "Las contraseñas no coinciden.";
            return;
        }

        try {
            const respuesta = await FastMarket.request("/auth/registro", {
                method: "POST",
                body: { nombre, correo, telefono, direccion, password }
            });

            FastMarket.guardarSesion(respuesta);
            mensajeRegistro.textContent = "Cuenta creada correctamente.";
            window.location.href = "productos.html";
        } catch (error) {
            mensajeRegistro.textContent = error.message;
        }
    });
});
