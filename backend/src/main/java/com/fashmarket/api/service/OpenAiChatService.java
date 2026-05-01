package com.fashmarket.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fashmarket.api.dto.ChatDtos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiChatService {
    private final ChatContextService chatContextService;
    private final ObjectMapper mapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;

    public OpenAiChatService(
            ChatContextService chatContextService,
            ObjectMapper mapper,
            @Value("${openai.api.key:}") String apiKey,
            @Value("${openai.model:gpt-4.1-mini}") String model
    ) {
        this.chatContextService = chatContextService;
        this.mapper = mapper;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model == null || model.isBlank() ? "gpt-4.1-mini" : model.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(12))
                .build();
    }

    public ChatDtos.ChatResponse responder(String mensaje, Long usuarioId) {
        ChatContextService.ChatContext contexto = chatContextService.construirContexto(mensaje, usuarioId);

        if (apiKey.isBlank()) {
            String respuestaLocal = chatContextService.respuestaLocal(mensaje, contexto);
            return new ChatDtos.ChatResponse(respuestaLocal, false, contexto.usandoDatosReales());
        }

        try {
            String instrucciones = """
                    Eres el asistente virtual de FashMarket, una tienda online.
                    Responde siempre en español, con tono amable, claro y breve.
                    Usa únicamente el contexto real de FashMarket entregado por el backend.
                    Si el usuario pregunta por precios, stock, ofertas o pedidos, responde según el contexto.
                    No inventes productos, precios, stock, pedidos, teléfonos, correos ni direcciones.
                    Si no hay datos suficientes, dilo claramente y orienta al usuario a revisar la sección correspondiente.
                    No pidas datos sensibles. No reveles información de otros usuarios.
                    Para pedidos específicos, solo usa los pedidos del usuario autenticado incluidos en el contexto.
                    """;

            String input = "Contexto real de FashMarket:\n"
                    + contexto.texto()
                    + "\nPregunta del cliente:\n"
                    + mensaje;

            Map<String, Object> body = Map.of(
                    "model", model,
                    "instructions", instrucciones,
                    "input", input,
                    "temperature", 0.3,
                    "max_output_tokens", 450
            );

            String jsonBody = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/responses"))
                    .timeout(Duration.ofSeconds(25))
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String fallback = chatContextService.respuestaLocal(mensaje, contexto);
                return new ChatDtos.ChatResponse(fallback, false, contexto.usandoDatosReales());
            }

            JsonNode json = mapper.readTree(response.body());
            String respuesta = extraerTexto(json);

            if (respuesta == null || respuesta.isBlank()) {
                respuesta = chatContextService.respuestaLocal(mensaje, contexto);
                return new ChatDtos.ChatResponse(respuesta, false, contexto.usandoDatosReales());
            }

            return new ChatDtos.ChatResponse(respuesta.trim(), true, contexto.usandoDatosReales());
        } catch (Exception e) {
            String fallback = chatContextService.respuestaLocal(mensaje, contexto);
            return new ChatDtos.ChatResponse(fallback, false, contexto.usandoDatosReales());
        }
    }

    private String extraerTexto(JsonNode json) {
        JsonNode outputText = json.get("output_text");
        if (outputText != null && outputText.isTextual()) return outputText.asText();

        JsonNode output = json.get("output");
        if (output != null && output.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : output) {
                JsonNode content = item.get("content");
                if (content != null && content.isArray()) {
                    for (JsonNode part : content) {
                        JsonNode text = part.get("text");
                        if (text != null && text.isTextual()) {
                            sb.append(text.asText()).append("\n");
                        }
                    }
                }
            }
            return sb.toString().trim();
        }

        JsonNode choices = json.get("choices");
        if (choices != null && choices.isArray() && !choices.isEmpty()) {
            JsonNode content = choices.get(0).path("message").path("content");
            if (content.isTextual()) return content.asText();
        }

        return "";
    }
}
