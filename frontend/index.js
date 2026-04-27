document.addEventListener("DOMContentLoaded", async () => {
    const despliegue = document.getElementById("despliegue");
    if (despliegue) setTimeout(() => despliegue.classList.add("abajo"), 0);

    FastMarket.activarBuscador("buscador", "busqueda");
    FastMarket.activarMenuCliente();
    FastMarket.mostrarPanelCliente();
    FastMarket.activarChatBasico();

    await Promise.allSettled([
        cargarContenidoIndex(),
        cargarProductosIndex()
    ]);
});

async function cargarContenidoIndex() {
    try {
        const contenidos = await FastMarket.request("/index-contenido?activo=true");
        aplicarHero(contenidos.filter((c) => c.tipo === "hero"));
        aplicarBeneficios(contenidos.filter((c) => c.tipo === "beneficio"));
        aplicarPasos(contenidos.filter((c) => c.tipo === "paso"));
        aplicarTestimonios(contenidos.filter((c) => c.tipo === "testimonio"));
        aplicarContacto(contenidos.filter((c) => c.tipo === "contacto"));
    } catch (error) {
        console.warn("No se pudo cargar contenido del index:", error.message);
    }
}

function aplicarHero(items) {
    const hero = items[0];
    if (!hero) return;
    const titulo = document.getElementById("cuadro2");
    const desc = document.getElementById("cuadro3");
    const img = document.getElementById("png");
    if (titulo) titulo.textContent = hero.titulo;
    if (desc) desc.textContent = hero.descripcion || "";
    if (img && hero.imagen) img.src = hero.imagen;
}

function aplicarBeneficios(items) {
    const contenedor = document.querySelector("#beneficios .beneficios-grid");
    if (!contenedor || !items.length) return;
    contenedor.innerHTML = items.map((item) => `
        <article class="beneficio">
            ${item.imagen ? `<img src="${FastMarket.escapeHTML(item.imagen)}" alt="${FastMarket.escapeHTML(item.titulo)}" onerror="this.style.display='none'">` : ""}
            <h3>${FastMarket.escapeHTML(item.titulo)}</h3>
            <p>${FastMarket.escapeHTML(item.descripcion || "")}</p>
        </article>
    `).join("");
}

function aplicarPasos(items) {
    const contenedor = document.querySelector("#como-comprar .pasos-grid");
    if (!contenedor || !items.length) return;
    contenedor.innerHTML = items.map((item, i) => `
        <article class="paso">
            <span>${i + 1}</span>
            <h3>${FastMarket.escapeHTML(item.titulo)}</h3>
            <p>${FastMarket.escapeHTML(item.descripcion || "")}</p>
        </article>
    `).join("");
}

function aplicarTestimonios(items) {
    const contenedor = document.querySelector("#testimonios .testimonios-grid");
    if (!contenedor || !items.length) return;
    contenedor.innerHTML = items.map((item) => `
        <article class="testimonio">
            <p>${FastMarket.escapeHTML(item.descripcion || "")}</p>
            <h4>- ${FastMarket.escapeHTML(item.titulo)}</h4>
        </article>
    `).join("");
}

function aplicarContacto(items) {
    const item = items[0];
    if (!item) return;
    const titulo = document.querySelector("#contacto-rapido .contacto-texto h2");
    const desc = document.querySelector("#contacto-rapido .contacto-texto p");
    if (titulo) titulo.textContent = item.titulo;
    if (desc) desc.textContent = item.descripcion || "";
}

async function cargarProductosIndex() {
    try {
        const productos = await FastMarket.request("/productos");
        pintarDestacados(productos.filter((p) => p.destacado).slice(0, 4));
        pintarOferta(productos.filter((p) => p.oferta)[0]);
    } catch (error) {
        console.warn("No se pudieron cargar productos del index:", error.message);
    }
}

function pintarDestacados(productos) {
    const grid = document.querySelector("#destacados .productos-grid");
    if (!grid || !productos.length) return;

    grid.innerHTML = productos.map((p) => `
        <article class="producto-card">
            <a href="detalle-producto.html?id=${p.id}">
                <img src="${FastMarket.escapeHTML(p.imagen || "img/logo.png")}" alt="${FastMarket.escapeHTML(p.nombre)}" onerror="this.src='img/logo.png'">
            </a>
            <h3>${FastMarket.escapeHTML(p.nombre)}</h3>
            <p>${FastMarket.escapeHTML(p.descripcion || "")}</p>
            <span>${FastMarket.money(p.precio)}</span>
        </article>
    `).join("");
}

function pintarOferta(producto) {
    if (!producto) return;
    const caja = document.querySelector("#ofertas .oferta-caja");
    if (!caja) return;

    const descuento = producto.precioAntes
        ? Math.round((1 - Number(producto.precio) / Number(producto.precioAntes)) * 100)
        : 0;

    caja.innerHTML = `
        <h3>${descuento > 0 ? `-${descuento}%` : "Oferta"}</h3>
        <p>${FastMarket.escapeHTML(producto.nombre)}</p>
        <small>${FastMarket.money(producto.precio)} ${producto.precioAntes ? `antes ${FastMarket.money(producto.precioAntes)}` : ""}</small>
    `;
}
