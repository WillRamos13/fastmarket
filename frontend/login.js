const tabLogin = document.getElementById("tab-login");
const tabRegistro = document.getElementById("tab-registro");

const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");

const irRegistro = document.getElementById("ir-registro");
const irLogin = document.getElementById("ir-login");

const mensajeLogin = document.getElementById("mensaje-login");
const mensajeRegistro = document.getElementById("mensaje-registro");

const loginCorreo = document.getElementById("login-correo");
const loginPassword = document.getElementById("login-password");

const registroNombre = document.getElementById("registro-nombre");
const registroCorreo = document.getElementById("registro-correo");
const registroTelefono = document.getElementById("registro-telefono");
const registroDireccion = document.getElementById("registro-direccion");
const registroPassword = document.getElementById("registro-password");
const registroConfirmar = document.getElementById("registro-confirmar");

let usuariosRegistrados = JSON.parse(localStorage.getItem("fashmarket_usuarios_clientes")) || [];

tabLogin.addEventListener("click", mostrarLogin);
tabRegistro.addEventListener("click", mostrarRegistro);
irRegistro.addEventListener("click", mostrarRegistro);
irLogin.addEventListener("click", mostrarLogin);

formRegistro.addEventListener("submit", registrarUsuario);
formLogin.addEventListener("submit", iniciarSesion);

function mostrarLogin() {
    tabLogin.classList.add("activo");
    tabRegistro.classList.remove("activo");

    formLogin.classList.add("activo-form");
    formRegistro.classList.remove("activo-form");

    limpiarMensajes();
}

function mostrarRegistro() {
    tabRegistro.classList.add("activo");
    tabLogin.classList.remove("activo");

    formRegistro.classList.add("activo-form");
    formLogin.classList.remove("activo-form");

    limpiarMensajes();
}

function registrarUsuario(e) {
    e.preventDefault();

    const nombre = registroNombre.value.trim();
    const correo = registroCorreo.value.trim().toLowerCase();
    const telefono = registroTelefono.value.trim();
    const direccion = registroDireccion.value.trim();
    const password = registroPassword.value.trim();
    const confirmar = registroConfirmar.value.trim();

    if (
        nombre === "" ||
        correo === "" ||
        telefono === "" ||
        direccion === "" ||
        password === "" ||
        confirmar === ""
    ) {
        mostrarMensaje(mensajeRegistro, "Completa todos los campos.", "error");
        return;
    }

    if (!validarCorreo(correo)) {
        mostrarMensaje(mensajeRegistro, "Ingresa un correo válido.", "error");
        return;
    }

    if (!validarTelefono(telefono)) {
        mostrarMensaje(mensajeRegistro, "El teléfono debe tener 9 dígitos.", "error");
        return;
    }

    if (password.length < 6) {
        mostrarMensaje(mensajeRegistro, "La contraseña debe tener mínimo 6 caracteres.", "error");
        return;
    }

    if (password !== confirmar) {
        mostrarMensaje(mensajeRegistro, "Las contraseñas no coinciden.", "error");
        return;
    }

    const existeUsuario = usuariosRegistrados.some((usuario) => usuario.correo === correo);

    if (existeUsuario) {
        mostrarMensaje(mensajeRegistro, "Este correo ya está registrado.", "error");
        return;
    }

    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        password: password,
        direcciones: [direccion],
        pedidos: []
    };

    usuariosRegistrados.push(nuevoUsuario);

    localStorage.setItem("fashmarket_usuarios_clientes", JSON.stringify(usuariosRegistrados));

    const clienteSesion = {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        telefono: nuevoUsuario.telefono,
        direcciones: nuevoUsuario.direcciones,
        pedidos: nuevoUsuario.pedidos
    };

    localStorage.setItem("fashmarket_cliente", JSON.stringify(clienteSesion));

    mostrarMensaje(mensajeRegistro, "Cuenta creada correctamente.", "ok");

    setTimeout(() => {
        window.location.href = "productos.html";
    }, 800);
}

function iniciarSesion(e) {
    e.preventDefault();

    const correo = loginCorreo.value.trim().toLowerCase();
    const password = loginPassword.value.trim();

    if (correo === "" || password === "") {
        mostrarMensaje(mensajeLogin, "Completa todos los campos.", "error");
        return;
    }

    if (!validarCorreo(correo)) {
        mostrarMensaje(mensajeLogin, "Ingresa un correo válido.", "error");
        return;
    }

    const usuario = usuariosRegistrados.find((item) => {
        return item.correo === correo && item.password === password;
    });

    if (!usuario) {
        mostrarMensaje(mensajeLogin, "Correo o contraseña incorrectos.", "error");
        return;
    }

    const clienteSesion = {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono,
        direcciones: usuario.direcciones || [],
        pedidos: usuario.pedidos || []
    };

    localStorage.setItem("fashmarket_cliente", JSON.stringify(clienteSesion));

    mostrarMensaje(mensajeLogin, "Sesión iniciada correctamente.", "ok");

    setTimeout(() => {
        window.location.href = "productos.html";
    }, 700);
}

function validarCorreo(correo) {
    return correo.includes("@") && correo.includes(".");
}

function validarTelefono(telefono) {
    return /^[0-9]{9}$/.test(telefono);
}

function mostrarMensaje(elemento, mensaje, tipo) {
    elemento.textContent = mensaje;

    if (tipo === "ok") {
        elemento.style.color = "#16a34a";
    } else {
        elemento.style.color = "#dc2626";
    }
}

function limpiarMensajes() {
    mensajeLogin.textContent = "";
    mensajeRegistro.textContent = "";
}