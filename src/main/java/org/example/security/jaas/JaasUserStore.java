package org.example.security.jaas;

import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.repository.AuthUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
/**
 * Componente de seguridad JAAS encargado de validar credenciales usadas por servicios protegidos.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */

@Component
public class JaasUserStore {
    private static AuthUserRepository repository;
    private static PasswordEncoder passwordEncoder;

    public JaasUserStore(AuthUserRepository repository, PasswordEncoder passwordEncoder) {
        JaasUserStore.repository = repository;
        JaasUserStore.passwordEncoder = passwordEncoder;
    }

    /**
     * Valida usuario y contraseña contra la tabla auth_users usando BCrypt.
     */
    public static boolean authenticate(String username, String password) {
        if (repository == null || passwordEncoder == null) return false;
        return repository.findByUsername(username)
                .filter(user -> Boolean.TRUE.equals(user.getActivo()))
                .map(AuthUser::getPassword)
                .map(hash -> passwordEncoder.matches(password, hash))
                .orElse(false);
    }

    /**
     * Valida credenciales y comprueba que el usuario tenga uno de los roles permitidos.
     * Se usa especialmente para proteger los endpoints SOAP de proveedor externo.
     */
    public static boolean authenticateWithRole(String username, String password, String... allowedRoles) {
        if (repository == null || passwordEncoder == null) return false;
        return repository.findByUsername(username)
                .filter(user -> Boolean.TRUE.equals(user.getActivo()))
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .filter(user -> {
                    if (allowedRoles == null || allowedRoles.length == 0) return true;
                    for (String role : allowedRoles) {
                        if (role != null && role.equalsIgnoreCase(user.getRole())) return true;
                    }
                    return false;
                })
                .isPresent();
    }
}
