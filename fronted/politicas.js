document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const cliente = JSON.parse(localStorage.getItem("fashmarket_cliente"));

    if (cliente && loginBtn) {
        loginBtn.textContent = "Mi perfil";
        loginBtn.href = "perfil.html";
    }
});