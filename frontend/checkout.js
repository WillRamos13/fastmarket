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

    let carrito = JSON.parse(localStorage.getItem("fashmarket_carrito")) || [];
    const costoEnvio = 8;

    cargarDatosCliente();
    mostrarResumen();

    if (form) form.addEventListener("submit", confirmarPedido);

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

    function mostrarResumen() {
        const lista = document.getElementById("lista-checkout");
        const subtotalTexto = document.getElementById("subtotal");
        const envioTexto = document.getElementById("envio");
        const totalTexto = document.getElementById("total");

        if (!lista) return;
        lista.innerHTML = "";

        if (carrito.length === 0) {
            lista.innerHTML = `<p>No tienes productos en el carrito.</p>`;
            if (subtotalTexto) subtotalTexto.textContent = FastMarket.money(0);
            if (envioTexto) envioTexto.textContent = FastMarket.money(0);
            if (totalTexto) totalTexto.textContent = FastMarket.money(0);
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
        if (subtotalTexto) subtotalTexto.textContent = FastMarket.money(subtotal);
        if (envioTexto) envioTexto.textContent = FastMarket.money(costoEnvio);
        if (totalTexto) totalTexto.textContent = FastMarket.money(subtotal + costoEnvio);
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
            items: carrito.map((item) => ({
                productoId: Number(item.id),
                cantidad: Number(item.cantidad)
            }))
        };

        try {
            mensajeCheckout.textContent = "Confirmando pedido...";
            const pedido = await FastMarket.request(`/pedidos/usuario/${usuario.id}`, {
                method: "POST",
                body: payload,
                auth: true
            });

            localStorage.removeItem("fashmarket_carrito");
            mensajeCheckout.textContent = `Pedido ${pedido.codigo} creado correctamente.`;
            window.location.href = `pedidos.html?pedido=${encodeURIComponent(pedido.codigo)}`;
        } catch (error) {
            mensajeCheckout.textContent = error.message;
        }
    }
});
