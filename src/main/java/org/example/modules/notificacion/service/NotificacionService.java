package org.example.modules.notificacion.service;

import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.notificacion.entity.Notificacion;
import org.example.modules.notificacion.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio de notificaciones internas.
 *
 * <p>Los métodos {@code notificar*} nunca lanzan excepciones hacia el flujo principal
 * (una venta o una inscripción no debe fallar porque no se pudo guardar un aviso) y
 * se ejecutan en su propia transacción.</p>
 */
@Service
public class NotificacionService {

    private final NotificacionRepository repository;
    private final AuthUserRepository authUserRepository;

    public NotificacionService(NotificacionRepository repository, AuthUserRepository authUserRepository) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificar(String destinatario, String tipo, String titulo, String mensaje) {
        try {
            guardar(destinatario, tipo, titulo, mensaje);
        } catch (Exception ignored) {
            // Una notificación fallida no debe afectar la operación principal.
        }
    }

    /** Envía el aviso a todos los usuarios con rol ADMIN. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificarAdmins(String tipo, String titulo, String mensaje) {
        try {
            for (AuthUser admin : authUserRepository.findByRole("ADMIN")) {
                guardar(admin.getUsername(), tipo, titulo, mensaje);
            }
        } catch (Exception ignored) {
        }
    }

    /** Envía el aviso al usuario vinculado a una persona (cliente/entrenador) por su authUserId. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificarPorAuthUserId(Long authUserId, String tipo, String titulo, String mensaje) {
        try {
            if (authUserId == null) return;
            authUserRepository.findById(authUserId)
                    .ifPresent(u -> guardar(u.getUsername(), tipo, titulo, mensaje));
        } catch (Exception ignored) {
        }
    }

    private void guardar(String destinatario, String tipo, String titulo, String mensaje) {
        if (destinatario == null || destinatario.isBlank()) return;
        Notificacion n = new Notificacion();
        n.setDestinatario(destinatario);
        n.setTipo(tipo);
        n.setTitulo(recortar(titulo, 150));
        n.setMensaje(recortar(mensaje, 500));
        n.setFecha(LocalDateTime.now());
        n.setLeida(false);
        repository.save(n);
    }

    @Transactional(readOnly = true)
    public List<Notificacion> listar(String username) {
        return repository.findTop50ByDestinatarioOrderByFechaDescIdNotificacionDesc(username);
    }

    @Transactional
    public void marcarLeida(Long id, String username) {
        repository.findByIdNotificacionAndDestinatario(id, username).ifPresent(n -> {
            n.setLeida(true);
            repository.save(n);
        });
    }

    @Transactional
    public void marcarTodasLeidas(String username) {
        repository.marcarTodasLeidas(username);
    }

    @Transactional
    public void eliminar(Long id, String username) {
        repository.findByIdNotificacionAndDestinatario(id, username).ifPresent(repository::delete);
    }

    @Transactional
    public void eliminarTodas(String username) {
        repository.eliminarTodas(username);
    }

    private String recortar(String texto, int max) {
        if (texto == null) return "";
        return texto.length() <= max ? texto : texto.substring(0, max - 1) + "…";
    }
}
