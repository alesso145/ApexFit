package org.example.modules.inscripcion.service;

import org.example.common.security.AuthContext;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.notificacion.service.NotificacionService;
import org.example.modules.inscripcion.entity.Inscripcion;
import org.example.modules.inscripcion.repository.InscripcionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/** Servicio de inscripciones con privacidad para clientes. */
@Service
public class InscripcionService {

    private final InscripcionRepository repository;
    private final AuthUserRepository authUserRepository;
    private final NotificacionService notificaciones;

    public InscripcionService(InscripcionRepository repository, AuthUserRepository authUserRepository,
                              NotificacionService notificaciones) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
        this.notificaciones = notificaciones;
    }

    public List<Inscripcion> listar() {
        if (AuthContext.isCliente()) {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username()).map(u -> u.getId()).orElse(-1L);
            return repository.findByClienteAuthUserId(authUserId);
        }
        return repository.findAll();
    }

    public Inscripcion buscarPorId(Integer id) { return repository.findById(id).orElse(null); }
    public Inscripcion guardar(Inscripcion inscripcion) {
        Inscripcion guardada = repository.save(inscripcion);
        try {
            if (guardada.getCliente() != null && guardada.getMembresia() != null) {
                String cliente = guardada.getCliente().getNombre() + " " + guardada.getCliente().getApellido();
                String plan = guardada.getMembresia().getNombre();
                if (AuthContext.isAdmin()) {
                    notificaciones.notificarPorAuthUserId(guardada.getCliente().getAuthUserId(), "INSCRIPCION",
                            "Membresía registrada", "Se registró tu membresía " + plan + " hasta el " + guardada.getFechaFin() + ".");
                } else {
                    notificaciones.notificarAdmins("INSCRIPCION", "Nueva inscripción de membresía",
                            cliente + " se inscribió al plan " + plan + ".");
                    notificaciones.notificarPorAuthUserId(guardada.getCliente().getAuthUserId(), "INSCRIPCION",
                            "Inscripción registrada", "Tu inscripción al plan " + plan + " fue registrada.");
                }
            }
        } catch (Exception ignored) {
            // La notificación nunca debe romper la inscripción.
        }
        return guardada;
    }

    public Inscripcion actualizar(Integer id, Inscripcion inscripcion) {
        AuthContext.requireAdmin();
        inscripcion.setIdInscripcion(id);
        return repository.save(inscripcion);
    }

    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }
}
