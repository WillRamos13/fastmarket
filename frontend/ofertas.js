let ofertas = [];
let busquedaOferta = "";
let ordenOferta = "normal";

document.addEventListener("DOMContentLoaded", async () => {
    FastMarket.activarBuscador("buscador-ofertas", "busqueda");
    FastMarket.activarMenuCliente();

    document.getElementById("buscar-oferta")?.addEventListener("input", (e) => {
        busquedaOferta = e.target.value.toLowerCase().trim();
        pintarOfertas();
    });

    document.getElementById("ordenar-oferta")?.addEventListener("change", (e) => {
        ordenOferta = e.target.value;
        pintarOfertas();
    });

    const buscadorHeader = document.getElementById("buscador-ofertas");
    buscadorHeader?.addEventListener("input", (e) => {
        busquedaOferta = e.target.value.toLowerCase().trim();
        const buscar = document.getElementById("buscar-oferta");
        if (buscar) buscar.value = e.target.value;
        pintarOfertas();
    });

    await cargarOfertas();
});

async function cargarOfertas() {
    const grid = document.getElementById("ofertas-grid");
    try {
        const data = await FastMarket.request("/productos?oferta=true");
        ofertas = Array.isArray(data) ? data : [];
        pintarOfertas();
    } catch (error) {
        if (grid) grid.innerHTML = `<div class="mensaje-error">No se pudieron cargar las ofertas: ${FastMarket.escapeHTML(error.message)}</div>`;
    }
}

function pintarOfertas() {
    const grid = document.getElementById("ofertas-grid");
    const vacio = document.getElementById("ofertas-vacio");
    if (!grid) return;

    let lista = ofertas.filter((p) => {
        const texto = `${p.nombre} ${p.descripcion || ""} ${p.categoria || ""}`.toLowerCase();
        return texto.includes(busquedaOferta);
    });

    if (ordenOferta === "precio-menor") lista.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (ordenOferta === "precio-mayor") lista.sort((a, b) => Number(b.precio) - Number(a.precio));
    if (ordenOferta === "descuento") lista.sort((a, b) => descuento(b) - descuento(a));

    grid.innerHTML = lista.map((p) => cardOferta(p)).join("");
    if (vacio) vacio.classList.toggle("oculto", lista.length > 0);
}

function cardOferta(producto) {
    const img = obtenerImagenesProducto(producto)[0] || "img/logo.png";
    const desc = descuento(producto);
    return `
        <article class="oferta-card">
            <div class="oferta-card-img">
                <img src="${FastMarket.escapeHTML(img)}" alt="${FastMarket.escapeHTML(producto.nombre)}" onerror="this.src='img/logo.png'">
                <span class="descuento-tag">${desc > 0 ? `-${desc}%` : "Oferta"}</span>
            </div>
            <div class="oferta-card-body">
                <small>${FastMarket.escapeHTML(producto.categoria || "General")}</small>
                <h3>${FastMarket.escapeHTML(producto.nombre)}</h3>
                <p>${FastMarket.escapeHTML(producto.descripcion || "Producto disponible en oferta.")}</p>
                <div class="precio-oferta">
                    <strong>${FastMarket.money(producto.precio)}</strong>
                    ${producto.precioAntes ? `<span>${FastMarket.money(producto.precioAntes)}</span>` : ""}
                </div>
                <a class="btn-ver-oferta" href="detalle-producto.html?id=${producto.id}">Ver producto</a>
            </div>
        </article>`;
}

function descuento(producto) {
    const actual = Number(producto.precio || 0);
    const anterior = Number(producto.precioAntes || 0);
    if (!anterior || anterior <= actual) return 0;
    return Math.max(0, Math.round((1 - actual / anterior) * 100));
}

function obtenerImagenesProducto(producto) {
    let imagenes = [];
    if (Array.isArray(producto?.imagenes)) imagenes = producto.imagenes;
    if (typeof producto?.imagenes === "string" && producto.imagenes.trim()) {
        try {
            const parsed = JSON.parse(producto.imagenes);
            if (Array.isArray(parsed)) imagenes = parsed;
        } catch {
            imagenes = producto.imagenes.split("\n");
        }
    }
    if (!imagenes.length && producto?.imagen) imagenes = [producto.imagen];
    imagenes = imagenes.map((img) => String(img || "").trim()).filter(Boolean);
    return imagenes.length ? [...new Set(imagenes)] : ["img/logo.png"];
}
