document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("form-registro");
    const formLogin = document.getElementById("form-login");

    const mostrarLoginBtn = document.getElementById("mostrar-login");
    const mostrarRegistroBtn = document.getElementById("mostrar-registro");
    const linkLoginSuperior = document.getElementById("link-login-superior");

    const tituloAuth = document.getElementById("titulo-auth");

    const btnRegistro = document.getElementById("btn-registro");

    const registroCorreo = document.getElementById("registro-correo");
    const registroNombre = document.getElementById("registro-nombre");
    const registroApellidos = document.getElementById("registro-apellidos");
    const registroDocumento = document.getElementById("registro-documento");
    const registroCelular = document.getElementById("registro-celular");
    const registroPassword = document.getElementById("registro-password");
    const aceptaTerminos = document.getElementById("acepta-terminos");
    const aceptaPoliticas = document.getElementById("acepta-politicas");

    const mensajeRegistro = document.getElementById("mensaje-registro");
    const mensajeLogin = document.getElementById("mensaje-login");

    const loginCorreo = document.getElementById("login-correo");
    const loginPassword = document.getElementById("login-password");

    const reglas = {
        length: document.getElementById("rule-length"),
        lower: document.getElementById("rule-lower"),
        number: document.getElementById("rule-number"),
        space: document.getElementById("rule-space"),
        upper: document.getElementById("rule-upper"),
        special: document.getElementById("rule-special")
    };

    function mostrarMensaje(elemento, texto, tipo = "error") {
        if (!elemento) return;

        elemento.textContent = texto;
        elemento.classList.remove("error", "ok");
        elemento.classList.add(tipo);
    }

    function limpiarMensaje(elemento) {
        if (!elemento) return;

        elemento.textContent = "";
        elemento.classList.remove("error", "ok");
    }

    function mostrarLogin() {
        formRegistro.classList.add("oculto");
        formLogin.classList.remove("oculto");
        tituloAuth.textContent = "Inicia sesión para comprar";
        limpiarMensaje(mensajeRegistro);
        limpiarMensaje(mensajeLogin);
    }

    function mostrarRegistro() {
        formLogin.classList.add("oculto");
        formRegistro.classList.remove("oculto");
        tituloAuth.textContent = "Inicia sesión o regístrate para comprar";
        limpiarMensaje(mensajeRegistro);
        limpiarMensaje(mensajeLogin);
    }

    if (mostrarLoginBtn) {
        mostrarLoginBtn.addEventListener("click", mostrarLogin);
    }

    if (linkLoginSuperior) {
        linkLoginSuperior.addEventListener("click", mostrarLogin);
    }

    if (mostrarRegistroBtn) {
        mostrarRegistroBtn.addEventListener("click", mostrarRegistro);
    }

    document.querySelectorAll(".toggle-password").forEach((boton) => {
        boton.addEventListener("click", () => {
            const targetId = boton.dataset.target;
            const input = document.getElementById(targetId);

            if (!input) return;

            input.type = input.type === "password" ? "text" : "password";
            boton.textContent = input.type === "password" ? "👁️" : "🙈";
        });
    });

    function validarCorreo(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    }

    function validarPassword(password) {
        const prohibidos = /[\\\/"'°¬¿¡Ññ]/;

        return {
            length: password.length >= 8,
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            space: !/\s/.test(password),
            upper: /[A-Z]/.test(password),
            special: !prohibidos.test(password)
        };
    }

    function pintarRegla(elemento, cumple) {
        if (!elemento) return;

        elemento.classList.remove("ok", "bad");
        elemento.classList.add(cumple ? "ok" : "bad");
    }

    function validarFormularioRegistro() {
        const correo = registroCorreo.value.trim();
        const nombre = registroNombre.value.trim();
        const apellidos = registroApellidos.value.trim();
        const documento = registroDocumento.value.trim();
        const celular = registroCelular.value.trim();
        const password = registroPassword.value;

        const pass = validarPassword(password);

        pintarRegla(reglas.length, pass.length);
        pintarRegla(reglas.lower, pass.lower);
        pintarRegla(reglas.number, pass.number);
        pintarRegla(reglas.space, pass.space);
        pintarRegla(reglas.upper, pass.upper);
        pintarRegla(reglas.special, pass.special);

        const passwordOk = Object.values(pass).every(Boolean);

        const formularioOk =
            validarCorreo(correo) &&
            nombre.length >= 2 &&
            apellidos.length >= 2 &&
            documento.length >= 8 &&
            celular.length >= 9 &&
            passwordOk &&
            aceptaTerminos.checked &&
            aceptaPoliticas.checked;

        btnRegistro.disabled = !formularioOk;

        return formularioOk;
    }

    [
        registroCorreo,
        registroNombre,
        registroApellidos,
        registroDocumento,
        registroCelular,
        registroPassword,
        aceptaTerminos,
        aceptaPoliticas
    ].forEach((elemento) => {
        if (!elemento) return;

        elemento.addEventListener("input", validarFormularioRegistro);
        elemento.addEventListener("change", validarFormularioRegistro);
    });

    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!validarFormularioRegistro()) {
                mostrarMensaje(mensajeRegistro, "Completa correctamente todos los campos.");
                return;
            }

            const correo = registroCorreo.value.trim().toLowerCase();
            const nombre = registroNombre.value.trim();
            const apellidos = registroApellidos.value.trim();
            const celular = registroCelular.value.trim();
            const password = registroPassword.value;

            const nombreCompleto = `${nombre} ${apellidos}`.trim();

            btnRegistro.disabled = true;
            btnRegistro.textContent = "Registrando...";
            mostrarMensaje(mensajeRegistro, "Creando tu cuenta...", "ok");

            try {
                const respuesta = await FastMarket.request("/auth/registro", {
                    method: "POST",
                    body: {
                        nombre: nombreCompleto,
                        correo,
                        telefono: celular,
                        password
                    }
                });

                const usuario = FastMarket.guardarSesion(respuesta);

                mostrarMensaje(mensajeRegistro, "Cuenta creada correctamente. Redirigiendo...", "ok");

                setTimeout(() => {
                    if (usuario.rol === "ADMIN") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "productos.html";
                    }
                }, 700);

            } catch (error) {
                mostrarMensaje(mensajeRegistro, error.message || "No se pudo registrar la cuenta.");
                btnRegistro.disabled = false;
                btnRegistro.textContent = "Regístrate";
            }
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            const correo = loginCorreo.value.trim().toLowerCase();
            const password = loginPassword.value.trim();

            if (!validarCorreo(correo)) {
                mostrarMensaje(mensajeLogin, "Ingresa un correo válido.");
                return;
            }

            if (!password) {
                mostrarMensaje(mensajeLogin, "Ingresa tu contraseña.");
                return;
            }

            const boton = formLogin.querySelector(".btn-auth");
            boton.disabled = true;
            boton.textContent = "Ingresando...";
            mostrarMensaje(mensajeLogin, "Validando tus datos...", "ok");

            try {
                const respuesta = await FastMarket.request("/auth/login", {
                    method: "POST",
                    body: {
                        correo,
                        password
                    }
                });

                const usuario = FastMarket.guardarSesion(respuesta);

                mostrarMensaje(mensajeLogin, "Inicio de sesión correcto. Redirigiendo...", "ok");

                setTimeout(() => {
                    if (usuario.rol === "ADMIN") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "productos.html";
                    }
                }, 600);

            } catch (error) {
                mostrarMensaje(mensajeLogin, error.message || "Correo o contraseña incorrectos.");
                boton.disabled = false;
                boton.textContent = "Iniciar sesión";
            }
        });
    }

    validarFormularioRegistro();
});