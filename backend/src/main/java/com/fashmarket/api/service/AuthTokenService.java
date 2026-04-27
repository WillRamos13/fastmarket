package com.fashmarket.api.service;

import com.fashmarket.api.model.Rol;
import com.fashmarket.api.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
public class AuthTokenService {
    private final String secret;
    private final long tokenHours;

    public AuthTokenService(
            @Value("${app.auth.secret}") String secret,
            @Value("${app.auth.token-hours:12}") long tokenHours
    ) {
        this.secret = secret;
        this.tokenHours = tokenHours;
    }

    public String generarToken(Usuario usuario) {
        long expira = System.currentTimeMillis() + Duration.ofHours(tokenHours).toMillis();
        String payload = usuario.getId() + "|" + usuario.getCorreo() + "|" + usuario.getRol().name() + "|" + expira;
        String payloadBase64 = base64Url(payload.getBytes(StandardCharsets.UTF_8));
        String firma = firmar(payloadBase64);
        return payloadBase64 + "." + firma;
    }

    public TokenData validar(String authorizationHeader) {
        String token = limpiarHeader(authorizationHeader);
        String[] partes = token.split("\\.");
        if (partes.length != 2) {
            throw new SecurityException("Token inválido");
        }

        String firmaEsperada = firmar(partes[0]);
        if (!constantTimeEquals(firmaEsperada, partes[1])) {
            throw new SecurityException("Token inválido");
        }

        String payload = new String(Base64.getUrlDecoder().decode(partes[0]), StandardCharsets.UTF_8);
        String[] datos = payload.split("\\|");
        if (datos.length != 4) {
            throw new SecurityException("Token inválido");
        }

        long expira = Long.parseLong(datos[3]);
        if (System.currentTimeMillis() > expira) {
            throw new SecurityException("Sesión vencida");
        }

        return new TokenData(Long.parseLong(datos[0]), datos[1], Rol.valueOf(datos[2]), expira);
    }

    public TokenData requerirAdmin(String authorizationHeader) {
        TokenData data = validar(authorizationHeader);
        if (data.rol() != Rol.ADMIN) {
            throw new SecurityException("Solo el administrador puede realizar esta acción");
        }
        return data;
    }

    public TokenData requerirUsuarioOAdmin(String authorizationHeader, Long usuarioId) {
        TokenData data = validar(authorizationHeader);
        if (data.rol() == Rol.ADMIN || data.usuarioId().equals(usuarioId)) {
            return data;
        }
        throw new SecurityException("No autorizado");
    }

    private String limpiarHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new SecurityException("Debes iniciar sesión");
        }
        if (authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        return authorizationHeader.trim();
    }

    private String firmar(String texto) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return base64Url(mac.doFinal(texto.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo firmar el token", e);
        }
    }

    private String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int resultado = 0;
        for (int i = 0; i < a.length(); i++) resultado |= a.charAt(i) ^ b.charAt(i);
        return resultado == 0;
    }

    public record TokenData(Long usuarioId, String correo, Rol rol, long expira) {}
}
