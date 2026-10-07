package org.example.modules.auth.service;

import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.cliente.repository.ClienteRepository;
import org.example.modules.entrenador.repository.EntrenadorRepository;
import org.example.modules.notificacion.service.NotificacionService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gestión de la cuenta del usuario: cambio de clave (autenticado) y recuperación de clave
 * (pública, verificando usuario + cédula). Aplica a roles CLIENTE y ENTRENADOR en la recuperación.
 */
@Service
public class CuentaService {

    private static final int MAX_INTENTOS = 5;
    private static final long VENTANA_MS = 15 * 60 * 1000L;

    private final AuthUserRepository authUserRepository;
    private final ClienteRepository clienteRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificacionService notificaciones;

    /** Intentos fallidos de recuperación por usuario (marcas de tiempo). */
    private final Map<String, Deque<Long>> intentosFallidos = new ConcurrentHashMap<>();

    public CuentaService(AuthUserRepository authUserRepository,
                         ClienteRepository clienteRepository,
                         EntrenadorRepository entrenadorRepository,
                         PasswordEncoder passwordEncoder,
                         NotificacionService notificaciones) {
        this.authUserRepository = authUserRepository;
        this.clienteRepository = clienteRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificaciones = notificaciones;
    }

    @Transactional
    public void cambiarClave(String username, String claveActual, String nuevaClave) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));
        if (!passwordEncoder.matches(claveActual, user.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta.");
        }
        validarNuevaClave(nuevaClave);
        if (passwordEncoder.matches(nuevaClave, user.getPassword())) {
            throw new IllegalArgumentException("La nueva contraseña debe ser diferente a la actual.");
        }
        user.setPassword(passwordEncoder.encode(nuevaClave));
        authUserRepository.save(user);
        notificaciones.notificar(user.getUsername(), "SEGURIDAD", "Contraseña actualizada",
                "Tu contraseña fue cambiada correctamente. Si no fuiste tú, contacta al administrador.");
    }

    @Transactional
    public void recuperarClave(String username, String cedula, String nuevaClave) {
        String usuario = username == null ? "" : username.trim();
        String ced = cedula == null ? "" : cedula.trim();
        validarNuevaClave(nuevaClave);
        verificarBloqueo(usuario);

        AuthUser user = authUserRepository.findByUsername(usuario).orElse(null);
        if (user == null || !Boolean.TRUE.equals(user.getActivo()) || !cedulaCoincide(user, ced)) {
            registrarFallo(usuario);
            // Mensaje genérico a propósito: no revela si el usuario existe.
            throw new IllegalArgumentException("Los datos ingresados no coinciden con ninguna cuenta.");
        }

        intentosFallidos.remove(usuario.toLowerCase());
        user.setPassword(passwordEncoder.encode(nuevaClave));
        authUserRepository.save(user);
        notificaciones.notificar(user.getUsername(), "SEGURIDAD", "Contraseña restablecida",
                "Tu contraseña fue restablecida desde la opción \"Recuperar contraseña\".");
        notificaciones.notificarAdmins("SEGURIDAD", "Clave restablecida",
                "El usuario \"" + user.getUsername() + "\" (" + user.getRole() + ") restableció su contraseña.");
    }

    /** Solo CLIENTE y ENTRENADOR pueden recuperar por cédula; el ADMIN no. */
    private boolean cedulaCoincide(AuthUser user, String cedula) {
        if (cedula.isEmpty()) return false;
        if ("CLIENTE".equals(user.getRole())) {
            return clienteRepository.findByAuthUserId(user.getId())
                    .map(c -> cedula.equals(c.getCedula() == null ? null : c.getCedula().trim()))
                    .orElse(false);
        }
        if ("ENTRENADOR".equals(user.getRole())) {
            return entrenadorRepository.findByAuthUserId(user.getId())
                    .map(e -> cedula.equals(e.getCedula() == null ? null : e.getCedula().trim()))
                    .orElse(false);
        }
        return false;
    }

    private void validarNuevaClave(String nuevaClave) {
        if (nuevaClave == null || nuevaClave.length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 6 caracteres.");
        }
    }

    private void verificarBloqueo(String usuario) {
        Deque<Long> fallos = intentosFallidos.get(usuario.toLowerCase());
        if (fallos == null) return;
        synchronized (fallos) {
            limpiarVencidos(fallos);
            if (fallos.size() >= MAX_INTENTOS) {
                throw new IllegalArgumentException("Demasiados intentos fallidos. Intenta de nuevo en unos minutos.");
            }
        }
    }

    private void registrarFallo(String usuario) {
        Deque<Long> fallos = intentosFallidos.computeIfAbsent(usuario.toLowerCase(), k -> new ArrayDeque<>());
        synchronized (fallos) {
            limpiarVencidos(fallos);
            fallos.addLast(System.currentTimeMillis());
        }
    }

    private void limpiarVencidos(Deque<Long> fallos) {
        long limite = System.currentTimeMillis() - VENTANA_MS;
        while (!fallos.isEmpty() && fallos.peekFirst() < limite) fallos.removeFirst();
    }
}
