package com.fashmarket.api.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String host;

    @Value("${app.mail.from:no-reply@fashmarket.local}")
    private String remitente;

    public CorreoService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public boolean disponible() {
        return mailSender != null && host != null && !host.isBlank();
    }

    public boolean enviarCodigoRegistro(String correo, String nombre, String codigo, int minutosValidez) {
        if (!disponible()) {
            System.out.println("[FashMarket DEV] Código de verificación para " + correo + ": " + codigo);
            return false;
        }

        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(remitente);
            mensaje.setTo(correo);
            mensaje.setSubject("Código de verificación FashMarket");
            mensaje.setText(
                    "Hola " + (nombre == null || nombre.isBlank() ? "" : nombre.trim()) + ",\n\n" +
                    "Tu código de verificación para crear tu cuenta en FashMarket es:\n\n" +
                    codigo + "\n\n" +
                    "Este código vence en " + minutosValidez + " minutos.\n\n" +
                    "Si no solicitaste este registro, puedes ignorar este mensaje.\n\n" +
                    "FashMarket"
            );

            mailSender.send(mensaje);
            return true;
        } catch (Exception e) {
            System.out.println("[FashMarket MAIL] No se pudo enviar correo a " + correo + ": " + e.getMessage());
            System.out.println("[FashMarket DEV] Código de verificación para " + correo + ": " + codigo);
            return false;
        }
    }
}
