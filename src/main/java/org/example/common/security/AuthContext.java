package org.example.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilidad central para obtener el usuario y rol autenticado desde Spring Security.
 */
public final class AuthContext {
    private AuthContext() {}

    public static String username() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return authentication.getName();
    }

    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) return false;
        String expected = "ROLE_" + role;
        return authentication.getAuthorities().stream().anyMatch(a -> expected.equals(a.getAuthority()));
    }

    public static boolean isAdmin() { return hasRole("ADMIN"); }
    public static boolean isCliente() { return hasRole("CLIENTE"); }
    public static boolean isEntrenador() { return hasRole("ENTRENADOR"); }

    public static void requireAdmin() {
        if (!isAdmin()) throw new SecurityException("Acceso permitido solo para ADMIN");
    }
}
