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

    // Procesar pago (simular Mercado Pago)
    async function procesarPago() {
        btnProcesar.disabled = true;

        // Mostrar estado de procesamiento
        mostrarProcesando("Procesando tu pago con Mercado Pago...");

        try {
            // Simular llamada a API de Mercado Pago
            // En producción, aquí integrarías la SDK real de Mercado Pago
            
            // Esperar un poco para simular procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Aquí iría la lógica real de integración con Mercado Pago
            // Por ahora simulamos un pago exitoso
            
            mostrarExito("¡Pago procesado correctamente! Redirigiendo...");

            // Registrar el pago en el backend
            await registrarPagoMercadoPago();

            // Redirigir a página de confirmación después de 2 segundos
            setTimeout(() => {
                if (datosCompra.codigoPedido) {
                    window.location.href = `pedidos.html?pedido=${encodeURIComponent(datosCompra.codigoPedido)}&pago=completado`;
                } else {
                    window.location.href = "pedidos.html";
                }
            }, 2000);

        } catch (error) {
            mostrarError(`Error al procesar el pago: ${error.message}`);
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
