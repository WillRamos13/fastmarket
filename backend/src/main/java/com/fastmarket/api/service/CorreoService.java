package com.fastmarket.api.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:FastMarket <fastmarket2026utp@gmail.com>}")
    private String remitente;

    public CorreoService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean disponible() {
        return mailUsername != null && !mailUsername.isBlank()
                && mailPassword != null && !mailPassword.isBlank();
    }

    public boolean enviarCodigoRegistro(String correo, String nombre, String codigo, int minutosValidez) {
        if (!disponible()) {
            System.out.println("[FastMarket DEV] Código de verificación para " + correo + ": " + codigo);
            return false;
        }

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

        return enviarCorreo(correo, "Código de verificación FastMarket", texto, html,
                "[FastMarket DEV] Código de verificación para " + correo + ": " + codigo);
    }

    public boolean enviarCodigoRecuperacion(String correo, String codigo, int minutosValidez) {
        if (!disponible()) {
            System.out.println("[FastMarket DEV] Código de recuperación para " + correo + ": " + codigo);
            return false;
        }

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
                Tu código para recuperar tu contraseña en FastMarket es:

                %s

                Este código vence en %d minutos.
                Si no solicitaste este cambio, ignora este mensaje.
                """.formatted(codigo, minutosValidez);

        return enviarCorreo(correo, "Código para recuperar contraseña FastMarket", texto, html,
                "[FastMarket DEV] Código de recuperación para " + correo + ": " + codigo);
    }

    private boolean enviarCorreo(String destino, String asunto, String texto, String html, String mensajeDev) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");

            helper.setFrom(remitente);
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(texto, html);

            mailSender.send(mensaje);
            return true;
        } catch (Exception e) {
            System.out.println("[FastMarket MAIL] No se pudo enviar correo a " + destino + ": " + e.getMessage());
            System.out.println(mensajeDev);
            return false;
        }
    }
}
