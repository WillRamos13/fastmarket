package com.fastmarket.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MercadoPagoService {

    private final RestTemplate restTemplate;

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${mercadopago.base-url:https://api.mercadopago.com}")
    private String baseUrl;

    public MercadoPagoService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> crearPreferencia(Map<String, Object> solicitud) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("Falta configurar mercadopago.access-token");
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("items", solicitud.getOrDefault("items", List.of()));
        payload.put("payer", solicitud.getOrDefault("payer", Map.of()));
        payload.put("external_reference", solicitud.getOrDefault("external_reference", ""));
        payload.put("statement_descriptor", "FastMarket");
        payload.put("auto_return", "approved");

        Map<String, String> backUrls = new HashMap<>();
        if (solicitud.get("back_urls") instanceof Map<?, ?> mapa) {
            mapa.forEach((clave, valor) -> backUrls.put(String.valueOf(clave), String.valueOf(valor)));
        } else {
            backUrls.put("success", String.valueOf(solicitud.getOrDefault("success_url", "http://localhost:5500/frontend/pedidos.html?status=approved")));
            backUrls.put("failure", String.valueOf(solicitud.getOrDefault("failure_url", "http://localhost:5500/frontend/mercado-pago.html?status=failure")));
            backUrls.put("pending", String.valueOf(solicitud.getOrDefault("pending_url", "http://localhost:5500/frontend/mercado-pago.html?status=pending")));
        }
        payload.put("back_urls", backUrls);

        if (solicitud.containsKey("notification_url")) {
            payload.put("notification_url", solicitud.get("notification_url"));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map<String, Object>> response;
        
        try {
            response = restTemplate.exchange(
                    baseUrl + "/checkout/preferences",
                    org.springframework.http.HttpMethod.POST,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );
        } catch (RestClientException e) {
            throw new IllegalStateException("Error al conectar con Mercado Pago: " + e.getMessage(), e);
        }

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("No se pudo crear la preferencia de Mercado Pago");
        }

        Map<String, Object> body = new HashMap<>();
        Object responseBody = response.getBody();
        if (responseBody instanceof Map<?, ?> mapBody) {
            mapBody.forEach((key, value) -> body.put(String.valueOf(key), value));
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", body.get("id"));
        resultado.put("status", body.get("status"));
        resultado.put("init_point", body.get("init_point"));
        resultado.put("sandbox_init_point", body.get("sandbox_init_point"));
        return resultado;
    }
}
