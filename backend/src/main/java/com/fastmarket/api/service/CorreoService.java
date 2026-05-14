package com.fastmarket.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class CorreoService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${app.mail.from:FastMarket <onboarding@resend.dev>}")
    private String remitente;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean disponible() {
        return resendApiKey != null && !resendApiKey.isBlank();
    }

    public boolean enviarCodigoRegistro(String correo, String nombre, String codigo, int minutosValidez) {
        if (!disponible()) {
            System.out.println("[FastMarket DEV] Código de verificación para " + correo + ": " + codigo);
            return false;
        }

        try {
            String nombreCliente = nombre == null || nombre.isBlank()
                    ? "cliente"
                    : nombre.trim();

            String html = """
                    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
                        <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:16px; padding:28px; border:1px solid #eeeeee;">
                            <h2 style="color:#fd6403; margin-top:0;">Código de verificación FastMarket</h2>
                            <p>Hola <strong>%s</strong>,</p>
                            <p>Tu código para crear tu cuenta en FastMarket es:</p>
                            <div style="font-size:32px; font-weight:800; letter-spacing:8px; color:#111827; background:#fff3eb; padding:16px; text-align:center; border-radius:12px;">
                                %s
                            </div>
                            <p>Este código vence en <strong>%d minutos</strong>.</p>
                            <p style="color:#666666;">Si no solicitaste este registro, puedes ignorar este mensaje.</p>
                            <hr style="border:none; border-top:1px solid #eeeeee; margin:24px 0;">
                            <p style="font-size:12px; color:#888888;">FastMarket</p>
                        </div>
                    </div>
                    """.formatted(nombreCliente, codigo, minutosValidez);

            String texto = """
                    Hola %s,

                    Tu código de verificación para crear tu cuenta en FastMarket es:

                    %s

                    Este código vence en %d minutos.

                    Si no solicitaste este registro, puedes ignorar este mensaje.

                    FastMarket
                    """.formatted(nombreCliente, codigo, minutosValidez);

            Map<String, Object> body = Map.of(
                    "from", remitente,
                    "to", List.of(correo),
                    "subject", "Código de verificación FastMarket",
                    "html", html,
                    "text", texto
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);
            headers.set("User-Agent", "FastMarket/1.0");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    request,
                    String.class
            );

            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            System.out.println("[FastMarket MAIL] No se pudo enviar correo a " + correo + ": " + e.getMessage());
            System.out.println("[FastMarket DEV] Código de verificación para " + correo + ": " + codigo);
            return false;
        }
    }

    public boolean enviarCodigoRecuperacion(String correo, String codigo, int minutosValidez) {
        if (!disponible()) {
            System.out.println("[FastMarket DEV] Código de recuperación para " + correo + ": " + codigo);
            return false;
        }

        try {
            String html = """
                    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
                        <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:16px; padding:28px; border:1px solid #eeeeee;">
                            <h2 style="color:#fd6403; margin-top:0;">Código para recuperar tu contraseña</h2>
                            <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta FastMarket.</p>
                            <div style="font-size:32px; font-weight:800; letter-spacing:8px; color:#111827; background:#fff3eb; padding:16px; text-align:center; border-radius:12px;">
                                %s
                            </div>
                            <p>Este código vence en <strong>%d minutos</strong>.</p>
                            <p style="color:#666666;">Si no solicitaste este cambio, ignora este mensaje.</p>
                        </div>
                    </div>
                    """.formatted(codigo, minutosValidez);

            String texto = """
                    Tu código para recuperar tu contraseña en FastMarket es: %s

                    Este código vence en %d minutos.
                    Si no solicitaste este cambio, ignora este mensaje.
                    """.formatted(codigo, minutosValidez);

            Map<String, Object> body = Map.of(
                    "from", remitente,
                    "to", List.of(correo),
                    "subject", "Código para recuperar contraseña FastMarket",
                    "html", html,
                    "text", texto
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);
            headers.set("User-Agent", "FastMarket/1.0");

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    new HttpEntity<>(body, headers),
                    String.class
            );

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.out.println("[FastMarket MAIL] No se pudo enviar recuperación a " + correo + ": " + e.getMessage());
            System.out.println("[FastMarket DEV] Código de recuperación para " + correo + ": " + codigo);
            return false;
        }
    }

}
