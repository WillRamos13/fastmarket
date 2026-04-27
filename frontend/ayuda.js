document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("login-btn");
    const cliente = JSON.parse(localStorage.getItem("fashmarket_cliente"));

    if (cliente && loginBtn) {
        loginBtn.textContent = "Mi perfil";
        loginBtn.href = "perfil.html";
    }

    const buscarAyuda = document.getElementById("buscar-ayuda");
    const faqItems = document.querySelectorAll(".faq-item");
    const sinResultados = document.getElementById("sin-resultados");

    buscarAyuda.addEventListener("input", () => {
        const texto = buscarAyuda.value.trim().toLowerCase();
        let encontrados = 0;

        faqItems.forEach((item) => {
            const contenido = item.textContent.toLowerCase();

            if (contenido.includes(texto)) {
                item.style.display = "block";
                encontrados++;
            } else {
                item.style.display = "none";
            }
        });

        if (encontrados === 0) {
            sinResultados.classList.remove("oculto");
        } else {
            sinResultados.classList.add("oculto");
        }
    });

});