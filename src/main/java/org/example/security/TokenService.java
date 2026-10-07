package org.example.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;


/**
 * Documentación JavaDoc de la clase TokenService.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.security.TokenService.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Componente de seguridad del sistema APEX FIT para autenticación, autorización, JWT, cookies o reglas de acceso.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Service
public class TokenService {

    @Value("${app.security.secret:cambia-esta-clave-secreta-gymcrud-2026}")
    private String secret;

    @Value("${app.security.expiration-seconds:86400}")
    private long expirationSeconds;

    public String generateToken(String username, String role) {
        long now = Instant.now().getEpochSecond();
        long expiresAt = now + expirationSeconds;

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = "{"
                + "\"sub\":\"" + escape(username) + "\","
                + "\"role\":\"" + escape(role) + "\","
                + "\"iat\":" + now + ","
                + "\"exp\":" + expiresAt
                + "}";

        String header = base64Url(headerJson);
        String payload = base64Url(payloadJson);
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    public boolean isValidToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String unsignedToken = parts[0] + "." + parts[1];
            String expectedSignature = sign(unsignedToken);
            if (!constantTimeEquals(expectedSignature, parts[2])) return false;

            long expiresAt = Long.parseLong(getClaim(token, "exp"));
            return expiresAt > Instant.now().getEpochSecond();
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return getClaim(token, "sub");
    }

    public String getRole(String token) {
        return getClaim(token, "role");
    }

    public int getExpirationSeconds() {
        return Math.toIntExact(expirationSeconds);
    }

    private String getClaim(String token, String claim) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) throw new IllegalArgumentException("Token JWT inválido");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

        String textKey = "\"" + claim + "\":\"";
        int textIndex = payload.indexOf(textKey);
        if (textIndex >= 0) {
            int start = textIndex + textKey.length();
            int end = payload.indexOf("\"", start);
            return payload.substring(start, end);
        }

        String numberKey = "\"" + claim + "\":";
        int numberIndex = payload.indexOf(numberKey);
        if (numberIndex >= 0) {
            int start = numberIndex + numberKey.length();
            int endComma = payload.indexOf(",", start);
            int endBrace = payload.indexOf("}", start);
            int end = endComma >= 0 ? Math.min(endComma, endBrace) : endBrace;
            return payload.substring(start, end).trim();
        }

        throw new IllegalArgumentException("Claim no encontrado: " + claim);
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo firmar el JWT", e);
        }
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
