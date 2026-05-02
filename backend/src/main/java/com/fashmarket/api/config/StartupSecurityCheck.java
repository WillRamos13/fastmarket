package com.fashmarket.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
public class StartupSecurityCheck implements ApplicationRunner {
    private static final Logger logger = Logger.getLogger(StartupSecurityCheck.class.getName());

    @Value("${app.auth.secret:}")
    private String authSecret;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.cors.allowed-origin-patterns:}")
    private String corsOrigins;

    @Override
    public void run(ApplicationArguments args) {
        advertirSiInseguro("APP_AUTH_SECRET", authSecret, "NO_SECRET_CONFIGURED", "fastmarket-dev-secret", "change-me");
        advertirSiInseguro("ADMIN_PASSWORD", adminPassword, "admin123", "password", "123456");
        if (corsOrigins != null && corsOrigins.contains("*")) {
            logger.warning("Configuración insegura: CORS_ALLOWED_ORIGIN_PATTERNS contiene '*'. En producción usa dominios exactos.");
        }
    }

    private void advertirSiInseguro(String variable, String valor, String... patronesPeligrosos) {
        String seguro = valor == null ? "" : valor.toLowerCase();
        boolean peligroso = seguro.isBlank() || seguro.length() < 16;
        for (String patron : patronesPeligrosos) {
            if (seguro.contains(patron.toLowerCase())) {
                peligroso = true;
                break;
            }
        }
        if (peligroso) {
            logger.warning("Configuración débil detectada en " + variable + ". Cambia este valor antes de publicar el proyecto.");
        }
    }
}
