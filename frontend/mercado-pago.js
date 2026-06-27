document.addEventListener("DOMContentLoaded", () => {
    FastMarket.activarMenuCliente();

    const btnProcesar = document.getElementById("btn-procesar-pago");
    const btnCancelar = document.getElementById("btn-cancelar-pago");
    const estadoPago = document.getElementById("estado-pago");
    const totalElement = document.getElementById("total-amount");

    let datosCompra = {
        total: 0,
        subtotal: 0,
        descuento: 0,
        envio: 0,
        pedidoId: null,
        items: [],
        codigoPedido: null
    };

    // Obtener datos de la URL
    function obtenerDatos() {
        const params = new URLSearchParams(window.location.search);
        
        datosCompra.total = Number(params.get("total")) || 0;
        datosCompra.subtotal = Number(params.get("subtotal")) || 0;
        datosCompra.descuento = Number(params.get("descuento")) || 0;
        datosCompra.envio = Number(params.get("envio")) || 0;
        datosCompra.pedidoId = params.get("pedidoId") || null;
        datosCompra.codigoPedido = params.get("codigo") || null;

        const itemsParam = params.get("items");
        if (itemsParam) {
            try {
                datosCompra.items = JSON.parse(decodeURIComponent(itemsParam));
            } catch (e) {
                datosCompra.items = [];
            }
        }

        // Si no hay datos válidos, redirigir a checkout
        if (datosCompra.total <= 0) {
            mostrarError("Error: datos de compra inválidos. Redirigiendo...");
            setTimeout(() => window.location.href = "checkout.html", 3000);
            return false;
        }

        mostrarDatos();
        return true;
    }

    function mostrarDatos() {
        // Mostrar el monto total
        totalElement.textContent = `S/ ${datosCompra.total.toFixed(2)}`;

        // Mostrar detalles del resumen
        document.getElementById("subtotal-mp").textContent = `S/ ${datosCompra.subtotal.toFixed(2)}`;
        document.getElementById("descuento-mp").textContent = datosCompra.descuento > 0 
            ? `- S/ ${datosCompra.descuento.toFixed(2)}`
            : "S/ 0.00";
        document.getElementById("envio-mp").textContent = `S/ ${datosCompra.envio.toFixed(2)}`;
        document.getElementById("total-mp").textContent = `S/ ${datosCompra.total.toFixed(2)}`;
    }

    function abrirMercadoPago() {
        const urlMercadoPago = "https://www.mercadopago.com.pe/";
        const popup = window.open(urlMercadoPago, "_blank", "noopener,noreferrer,width=1200,height=900");

        if (!popup) {
            window.location.href = urlMercadoPago;
        }
    }

    // Procesar pago y redirigir a Mercado Pago
    async function procesarPago() {
        btnProcesar.disabled = true;
        mostrarProcesando("Redirigiendo a Mercado Pago...");

        try {
            abrirMercadoPago();
            mostrarExito("Se abrió Mercado Pago en una nueva ventana.");

            setTimeout(() => {
                btnProcesar.disabled = false;
            }, 1500);
        } catch (error) {
            mostrarError(`Error al abrir Mercado Pago: ${error.message}`);
            btnProcesar.disabled = false;
        }
    }

    // Registrar pago en el backend
    async function registrarPagoMercadoPago() {
        const usuario = FastMarket.getCliente();
        if (!usuario || !datosCompra.pedidoId) return;

        try {
            await FastMarket.request(`/pedidos/${datosCompra.pedidoId}/pago`, {
                method: "PUT",
                auth: true,
                body: {
                    metodoPago: "Mercado Pago",
                    estado: "CONFIRMADO",
                    total: datosCompra.total,
                    referencia: `MP-${Date.now()}`
                }
            });
        } catch (error) {
            console.error("Error registrando pago:", error);
            // No interrumpir el flujo si falla el registro
        }
    }

    function mostrarProcesando(mensaje) {
        estadoPago.innerHTML = `
            <div class="estado-pago processing">
                <div class="loader"></div>
                <p><strong>${mensaje}</strong></p>
                <p>Por favor, no cierres esta ventana...</p>
            </div>
        `;
    }

    function mostrarExito(mensaje) {
        estadoPago.innerHTML = `
            <div class="estado-pago success">
                <p><strong>✓ ${mensaje}</strong></p>
            </div>
        `;
    }

    function mostrarError(mensaje) {
        estadoPago.innerHTML = `
            <div class="estado-pago error">
                <p><strong>✗ ${mensaje}</strong></p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">Intenta nuevamente o contacta a soporte.</p>
            </div>
        `;
    }

    // Event Listeners
    btnProcesar.addEventListener("click", () => {
        if (!datosCompra.total || datosCompra.total <= 0) {
            mostrarError("El monto a pagar no es válido.");
            return;
        }

        // Confirmar antes de procesar
        if (confirm(`¿Deseas procesar un pago de S/ ${datosCompra.total.toFixed(2)} con Mercado Pago?`)) {
            procesarPago();
        }
    });

    btnCancelar.addEventListener("click", () => {
        if (confirm("¿Deseas cancelar este pago? Volverás al checkout.")) {
            window.location.href = "checkout.html";
        }
    });

    // Inicializar
    if (!obtenerDatos()) {
        return;
    }
});
