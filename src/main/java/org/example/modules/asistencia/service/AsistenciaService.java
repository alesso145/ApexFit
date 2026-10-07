package org.example.modules.asistencia.service;

import org.example.common.security.AuthContext;
import org.example.modules.asistencia.entity.Asistencia;
import org.example.modules.asistencia.repository.AsistenciaRepository;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.notificacion.service.NotificacionService;
import org.springframework.stereotype.Service;
import java.util.List;

/** Servicio de asistencias con separación por cliente y entrenador. */
@Service
public class AsistenciaService {

    private final AsistenciaRepository repository;
    private final AuthUserRepository authUserRepository;
    private final NotificacionService notificaciones;

    public AsistenciaService(AsistenciaRepository repository, AuthUserRepository authUserRepository,
                             NotificacionService notificaciones) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
        this.notificaciones = notificaciones;
    }

    public List<Asistencia> listar() {
        Long authUserId = authUserRepository.findByUsername(AuthContext.username()).map(u -> u.getId()).orElse(-1L);
        if (AuthContext.isCliente()) return repository.findByClienteAuthUserId(authUserId);
        if (AuthContext.isEntrenador()) return repository.findByClaseEntrenadorAuthUserId(authUserId);
        return repository.findAll();
    }

    public Asistencia buscarPorId(Integer id) { return repository.findById(id).orElse(null); }
    public Asistencia guardar(Asistencia asistencia) {
        Asistencia guardada = repository.save(asistencia);
        notificarInscripcionAClase(guardada);
        return guardada;
    }

    /** Avisa al cliente, al entrenador de la clase y (si no la registró un admin) a los administradores. */
    private void notificarInscripcionAClase(Asistencia a) {
        try {
            if (a == null || a.getClase() == null || a.getCliente() == null) return;
            String clase = a.getClase().getNombre();
            String horario = a.getClase().getHorario() == null ? "" : " (" + a.getClase().getHorario() + ")";
            String cliente = a.getCliente().getNombre() + " " + a.getCliente().getApellido();
            String fecha = String.valueOf(a.getFechaAsistencia());

            notificaciones.notificarPorAuthUserId(a.getCliente().getAuthUserId(), "CLASE", "Inscripción a clase",
                    "Quedaste inscrito en " + clase + horario + " para el " + fecha + ".");
            if (a.getClase().getEntrenador() != null) {
                notificaciones.notificarPorAuthUserId(a.getClase().getEntrenador().getAuthUserId(), "CLASE",
                        "Nuevo alumno en tu clase",
                        cliente + " se inscribió en " + clase + horario + " para el " + fecha + ".");
            }
            if (!AuthContext.isAdmin()) {
                notificaciones.notificarAdmins("CLASE", "Nueva inscripción a clase",
                        cliente + " se inscribió en " + clase + horario + " para el " + fecha + ".");
            }
        } catch (Exception ignored) {
            // La notificación nunca debe romper el registro de asistencia.
        }
    }

    public Asistencia actualizar(Integer id, Asistencia asistencia) {
        AuthContext.requireAdmin();
        asistencia.setIdAsistencia(id);
        return repository.save(asistencia);
    }

    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }
}
