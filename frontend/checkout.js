document.addEventListener("DOMContentLoaded", () => {
    FastMarket.activarBuscador("buscador", "busqueda");
    FastMarket.activarMenuCliente();

    const form = document.getElementById("form-checkout");
    const mensajeLogin = document.getElementById("mensaje-login");
    const mensajeCheckout = document.getElementById("mensaje-checkout");

    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const telefono = document.getElementById("telefono");
    const direccion = document.getElementById("direccion");
    const referencia = document.getElementById("referencia");
    const horario = document.getElementById("horario");
    const inputCupon = document.getElementById("codigo-cupon");
    const btnCupon = document.getElementById("aplicar-cupon");
    const mensajeCupon = document.getElementById("mensaje-cupon");

    let carrito = [];
    let cuponAplicado = null;
    const costoEnvio = 8;

    cargarDatosCliente();
    cargarCarritoPersistente();

    if (form) form.addEventListener("submit", confirmarPedido);
    if (btnCupon) btnCupon.addEventListener("click", aplicarCupon);

    async function cargarCarritoPersistente() {
        const usuario = FastMarket.getCliente();
        if (usuario) {
            const local = JSON.parse(localStorage.getItem("fastmarket_carrito") || "[]");
            const cuponLocal = JSON.parse(localStorage.getItem("fastmarket_cupon") || "null");
            if (local.length) {
                await FastMarket.sincronizarCarrito(local, cuponLocal?.codigo || null);
            }
        }
        const data = await FastMarket.obtenerCarrito();
        carrito = (data.items || []).map((item) => ({
            id: item.productoId || item.id,
            nombre: item.nombre,
            imagen: item.imagen,
            precio: Number(item.precio || 0),
            cantidad: Number(item.cantidad || 1)
        }));
        cuponAplicado = data.cuponCodigo ? { codigo: data.cuponCodigo, descuento: data.descuento || 0 } : JSON.parse(localStorage.getItem("fastmarket_cupon") || "null");
        if (inputCupon && cuponAplicado?.codigo) inputCupon.value = cuponAplicado.codigo;
        mostrarResumen();
    }

    function cargarDatosCliente() {
        const usuario = FastMarket.getCliente();
        if (!usuario) {
            if (mensajeLogin) mensajeLogin.classList.remove("oculto");
            if (form) form.classList.add("oculto");
            return;
        }
        if (mensajeLogin) mensajeLogin.classList.add("oculto");
        if (form) form.classList.remove("oculto");
        nombre.value = usuario.nombre || "";
        correo.value = usuario.correo || "";
        telefono.value = usuario.telefono || "";
        const primeraDireccion = (usuario.direcciones || [])[0];
        if (primeraDireccion) {
            direccion.value = primeraDireccion.direccion || primeraDireccion;
            referencia.value = primeraDireccion.referencia || "";
        }
    }

    async function aplicarCupon() {
        const codigo = inputCupon?.value.trim().toUpperCase();
        if (!codigo) {
            cuponAplicado = null;
            await FastMarket.sincronizarCarrito(carrito, null);
            mostrarMensajeCupon("Cupón eliminado.", "ok");
            mostrarResumen();
            return;
        }
        if (!carrito.length) {
            mostrarMensajeCupon("Agrega productos antes de aplicar un cupón.", "error");
            return;
        }
        try {
            mostrarMensajeCupon("Validando cupón...", "ok");
            const respuesta = await FastMarket.request("/cupones/aplicar", {
                method: "POST",
                body: {
                    codigo,
                    items: carrito.map((item) => ({ productoId: Number(item.id), cantidad: Number(item.cantidad) }))
                }
            });
            cuponAplicado = respuesta;
            await FastMarket.sincronizarCarrito(carrito, cuponAplicado.codigo);
            mostrarMensajeCupon(`${respuesta.mensaje} Descuento: ${FastMarket.money(respuesta.descuento)}`, "ok");
            mostrarResumen();
        } catch (error) {
            cuponAplicado = null;
            await FastMarket.sincronizarCarrito(carrito, null);
            mostrarMensajeCupon(error.message, "error");
            mostrarResumen();
        }
    }

    function mostrarMensajeCupon(texto, tipo) {
        if (!mensajeCupon) return;
        mensajeCupon.textContent = texto;
        mensajeCupon.classList.remove("ok", "error");
        mensajeCupon.classList.add(tipo);
    }

    function mostrarResumen() {
        const lista = document.getElementById("lista-checkout");
        const subtotalTexto = document.getElementById("subtotal");
        const envioTexto = document.getElementById("envio");
        const totalTexto = document.getElementById("total");
        const descuentoTexto = document.getElementById("descuento");
        const filaDescuento = document.getElementById("fila-descuento");

        if (!lista) return;
        lista.innerHTML = "";

        if (carrito.length === 0) {
            lista.innerHTML = `<p>No tienes productos en el carrito.</p>`;
            if (subtotalTexto) subtotalTexto.textContent = FastMarket.money(0);
            if (envioTexto) envioTexto.textContent = FastMarket.money(0);
            if (descuentoTexto) descuentoTexto.textContent = `- ${FastMarket.money(0)}`;
            if (totalTexto) totalTexto.textContent = FastMarket.money(0);
            filaDescuento?.classList.add("oculto");
            return;
        }

        carrito.forEach((item) => {
            const div = document.createElement("div");
            div.className = "item-checkout";
            div.innerHTML = `
                <img src="${FastMarket.escapeHTML(item.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(item.nombre)}" onerror="this.src='img/logo.png'">
                <div>
                    <h4>${FastMarket.escapeHTML(item.nombre)}</h4>
                    <p>Cantidad: ${item.cantidad}</p>
                    <strong>${FastMarket.money(Number(item.precio) * Number(item.cantidad))}</strong>
                </div>`;
            lista.appendChild(div);
        });

        const subtotal = carrito.reduce((s, item) => s + Number(item.precio) * Number(item.cantidad), 0);
        const descuento = Number(cuponAplicado?.descuento || 0);
        if (subtotalTexto) subtotalTexto.textContent = FastMarket.money(subtotal);
        if (envioTexto) envioTexto.textContent = FastMarket.money(costoEnvio);
        if (descuentoTexto) descuentoTexto.textContent = `- ${FastMarket.money(descuento)}`;
        if (filaDescuento) filaDescuento.classList.toggle("oculto", descuento <= 0);
        if (totalTexto) totalTexto.textContent = FastMarket.money(Math.max(0, subtotal - descuento + costoEnvio));
    }

    async function confirmarPedido(e) {
        e.preventDefault();
        const usuario = FastMarket.requireCliente(true);
        if (!usuario) return;
        if (carrito.length === 0) {
            mensajeCheckout.textContent = "Tu carrito está vacío.";
            return;
        }
        if (!direccion.value.trim()) {
            mensajeCheckout.textContent = "Ingresa una dirección de entrega.";
            return;
        }
        const pago = document.querySelector('input[name="pago"]:checked')?.value || "Pago contra entrega";
        const payload = {
            direccionEntrega: direccion.value.trim(),
            referenciaEntrega: referencia.value.trim(),
            horarioEntrega: horario.value,
            metodoPago: pago,
            telefonoEntrega: telefono.value.trim(),
            costoEnvio,
            cuponCodigo: cuponAplicado?.codigo || "",
            items: carrito.map((item) => ({ productoId: Number(item.id), cantidad: Number(item.cantidad) }))
        };
        try {
            mensajeCheckout.textContent = "Confirmando pedido...";
            const pedido = await FastMarket.request(`/pedidos/usuario/${usuario.id}`, { method: "POST", body: payload, auth: true });
            await FastMarket.limpiarCarritoUsuario();
            mensajeCheckout.textContent = `Pedido ${pedido.codigo} creado correctamente.`;
            window.location.href = `pedidos.html?pedido=${encodeURIComponent(pedido.codigo)}`;
        } catch (error) {
            mensajeCheckout.textContent = error.message;
        }
    }
});
