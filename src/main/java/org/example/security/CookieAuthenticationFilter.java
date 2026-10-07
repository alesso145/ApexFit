package org.example.security;

/**
 * Clase conservada solo por compatibilidad de nombre con versiones anteriores.
 * La autenticación real ahora se realiza con JwtAuthenticationFilter y JWT estándar.
 */
public final class CookieAuthenticationFilter {
    public static final String COOKIE_NAME = JwtAuthenticationFilter.COOKIE_NAME;

    private CookieAuthenticationFilter() {
    }
}
