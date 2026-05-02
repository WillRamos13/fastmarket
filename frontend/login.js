document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("form-registro");
    const formLogin = document.getElementById("form-login");

    const tabRegistro = document.getElementById("tab-registro");
    const tabLogin = document.getElementById("tab-login");

    const tituloAuth = document.getElementById("titulo-auth");
    const subtituloAuth = document.getElementById("subtitulo-auth");

    const btnRegistro = document.getElementById("btn-registro");
    const btnReenviar = document.getElementById("reenviar-codigo");
    const codigoPanel = document.getElementById("codigo-panel");
    const codigoVerificacion = document.getElementById("codigo-verificacion");

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

    let codigoEnviado = false;
    let correoCodigoEnviado = "";

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

    function activarTab(tab) {
        const esLogin = tab === "login";

        formRegistro.classList.toggle("oculto", esLogin);
        formLogin.classList.toggle("oculto", !esLogin);
        tabRegistro.classList.toggle("activo", !esLogin);
        tabLogin.classList.toggle("activo", esLogin);

        tituloAuth.textContent = esLogin ? "Inicia sesión en FastMarket" : "Crea tu cuenta en FastMarket";
        subtituloAuth.textContent = esLogin
            ? "Accede con tu correo y contraseña para revisar pedidos o entrar al panel si eres administrador."
            : "Regístrate con verificación por correo para comprar, revisar pedidos y guardar tus datos.";

        limpiarMensaje(mensajeRegistro);
        limpiarMensaje(mensajeLogin);
    }

    tabRegistro.addEventListener("click", () => activarTab("registro"));
    tabLogin.addEventListener("click", () => activarTab("login"));

    document.querySelectorAll(".toggle-password").forEach((boton) => {
        boton.addEventListener("click", () => {
            const input = document.getElementById(boton.dataset.target);
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
        if (registroPassword.value.length > 0) {
            elemento.classList.add(cumple ? "ok" : "bad");
        }
    }

    function datosRegistro() {
        const nombre = registroNombre.value.trim();
        const apellidos = registroApellidos.value.trim();

        return {
            correo: registroCorreo.value.trim().toLowerCase(),
            nombre,
            apellidos,
            nombreCompleto: `${nombre} ${apellidos}`.trim(),
            documento: registroDocumento.value.trim(),
            celular: registroCelular.value.trim(),
            password: registroPassword.value,
            codigo: codigoVerificacion ? codigoVerificacion.value.trim() : ""
        };
    }

    function resetearCodigoSiCambioCorreo() {
        const correoActual = registroCorreo.value.trim().toLowerCase();

        if (codigoEnviado && correoActual !== correoCodigoEnviado) {
            codigoEnviado = false;
            correoCodigoEnviado = "";
            if (codigoVerificacion) codigoVerificacion.value = "";
            if (codigoPanel) codigoPanel.classList.add("oculto");
            btnRegistro.textContent = "Enviar código al correo";
        }
    }

    function validarFormularioRegistro() {
        resetearCodigoSiCambioCorreo();

        const datos = datosRegistro();
        const pass = validarPassword(datos.password);

        pintarRegla(reglas.length, pass.length);
        pintarRegla(reglas.lower, pass.lower);
        pintarRegla(reglas.number, pass.number);
        pintarRegla(reglas.space, pass.space);
        pintarRegla(reglas.upper, pass.upper);
        pintarRegla(reglas.special, pass.special);

        const passwordOk = Object.values(pass).every(Boolean);

        const formularioOk =
            validarCorreo(datos.correo) &&
            datos.nombre.length >= 2 &&
            datos.apellidos.length >= 2 &&
            datos.documento.length >= 8 &&
            datos.celular.replace(/\D/g, "").length >= 9 &&
            passwordOk &&
            aceptaTerminos.checked &&
            aceptaPoliticas.checked;

        if (!codigoEnviado) {
            btnRegistro.disabled = !formularioOk;
        } else {
            btnRegistro.disabled = !formularioOk || datos.codigo.length !== 6;
        }

        return formularioOk;
    }

    async function enviarCodigo() {
        const datos = datosRegistro();

        if (!validarFormularioRegistro()) {
            mostrarMensaje(mensajeRegistro, "Completa correctamente todos los campos antes de solicitar el código.");
            return;
        }

        btnRegistro.disabled = true;
        btnRegistro.textContent = "Enviando código...";
        mostrarMensaje(mensajeRegistro, "Enviando código de verificación...", "ok");

        try {
            const respuesta = await FastMarket.request("/auth/registro/enviar-codigo", {
                method: "POST",
                body: {
                    correo: datos.correo,
                    nombre: datos.nombreCompleto
                }
            });

            codigoEnviado = true;
            correoCodigoEnviado = datos.correo;
            if (codigoPanel) codigoPanel.classList.remove("oculto");
            btnRegistro.textContent = "Verificar y crear cuenta";
            if (codigoVerificacion) codigoVerificacion.focus();
            mostrarMensaje(mensajeRegistro, respuesta?.mensaje || "Te enviamos un código a tu correo.", "ok");
        } catch (error) {
            mostrarMensaje(mensajeRegistro, error.message || "No se pudo enviar el código.");
            btnRegistro.textContent = "Enviar código al correo";
        } finally {
            validarFormularioRegistro();
        }
    }

    async function registrarCuenta() {
        const datos = datosRegistro();

        if (!validarFormularioRegistro() || datos.codigo.length !== 6) {
            mostrarMensaje(mensajeRegistro, "Ingresa el código de 6 dígitos enviado a tu correo.");
            return;
        }

        btnRegistro.disabled = true;
        btnRegistro.textContent = "Creando cuenta...";
        mostrarMensaje(mensajeRegistro, "Verificando código y creando tu cuenta...", "ok");

        try {
            const respuesta = await FastMarket.request("/auth/registro", {
                method: "POST",
                body: {
                    nombre: datos.nombreCompleto,
                    correo: datos.correo,
                    telefono: datos.celular,
                    documento: datos.documento,
                    password: datos.password,
                    codigoVerificacion: datos.codigo
                }
            });

            const usuario = FastMarket.guardarSesion(respuesta);
            mostrarMensaje(mensajeRegistro, "Cuenta verificada correctamente. Redirigiendo...", "ok");

            setTimeout(() => {
                window.location.href = usuario.rol === "ADMIN" ? "admin.html" : (usuario.rol === "VENDEDOR" ? "vendedor.html" : "productos.html");
            }, 700);
        } catch (error) {
            mostrarMensaje(mensajeRegistro, error.message || "No se pudo crear la cuenta.");
            btnRegistro.textContent = "Verificar y crear cuenta";
            validarFormularioRegistro();
        }
    }

    [
        registroCorreo,
        registroNombre,
        registroApellidos,
        registroDocumento,
        registroCelular,
        registroPassword,
        aceptaTerminos,
        aceptaPoliticas,
        codigoVerificacion
    ].forEach((elemento) => {
        if (!elemento) return;
        elemento.addEventListener("input", validarFormularioRegistro);
        elemento.addEventListener("change", validarFormularioRegistro);
    });

    if (codigoVerificacion) {
        codigoVerificacion.addEventListener("input", () => {
            codigoVerificacion.value = codigoVerificacion.value.replace(/\D/g, "").slice(0, 6);
            validarFormularioRegistro();
        });
    }

    if (btnReenviar) {
        btnReenviar.addEventListener("click", enviarCodigo);
    }

    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!codigoEnviado) {
            await enviarCodigo();
        } else {
            await registrarCuenta();
        }
    });

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
                body: { correo, password }
            });

            const usuario = FastMarket.guardarSesion(respuesta);
            mostrarMensaje(mensajeLogin, "Inicio de sesión correcto. Redirigiendo...", "ok");

            setTimeout(() => {
                window.location.href = usuario.rol === "ADMIN" ? "admin.html" : (usuario.rol === "VENDEDOR" ? "vendedor.html" : "productos.html");
            }, 600);
        } catch (error) {
            mostrarMensaje(mensajeLogin, error.message || "Correo o contraseña incorrectos.");
            boton.disabled = false;
            boton.textContent = "Iniciar sesión";
        }
    });

    validarFormularioRegistro();
});
