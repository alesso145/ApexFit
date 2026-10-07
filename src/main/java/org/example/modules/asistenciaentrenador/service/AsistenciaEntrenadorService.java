package org.example.modules.asistenciaentrenador.service;

import org.example.common.security.AuthContext;
import org.example.modules.asistenciaentrenador.entity.AsistenciaEntrenador;
import org.example.modules.asistenciaentrenador.repository.AsistenciaEntrenadorRepository;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.clase.repository.ClaseRepository;
import org.example.modules.entrenador.entity.Entrenador;
import org.example.modules.entrenador.repository.EntrenadorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Servicio de negocio para la asistencia de entrenadores.
 *
 * <p>Aplica separación por rol: ADMIN puede ver todo, mientras que ENTRENADOR
 * solo puede ver o registrar su propia asistencia. La asociación con el entrenador
 * logueado se realiza automáticamente mediante el usuario autenticado.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Service
public class AsistenciaEntrenadorService {

    private final AsistenciaEntrenadorRepository repository;
    private final AuthUserRepository authUserRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final ClaseRepository claseRepository;

    public AsistenciaEntrenadorService(AsistenciaEntrenadorRepository repository,
                                       AuthUserRepository authUserRepository,
                                       EntrenadorRepository entrenadorRepository,
                                       ClaseRepository claseRepository) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.claseRepository = claseRepository;
    }

    /** Lista asistencias según el rol autenticado. */
    public List<AsistenciaEntrenador> listar() {
        if (AuthContext.isEntrenador()) {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username()).map(u -> u.getId()).orElse(-1L);
            return repository.findByEntrenadorAuthUserId(authUserId);
        }
        return repository.findAll();
    }

    /** Busca una asistencia por identificador. */
    public AsistenciaEntrenador buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    /**
     * Guarda una asistencia. Si el usuario es ENTRENADOR, se asigna automáticamente
     * el entrenador vinculado a su cuenta para evitar registrar datos de terceros.
     */
    public AsistenciaEntrenador guardar(AsistenciaEntrenador asistencia) {
        if (AuthContext.isEntrenador()) {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username()).map(u -> u.getId()).orElse(-1L);
            Entrenador entrenador = entrenadorRepository.findAll().stream()
                    .filter(e -> authUserId.equals(e.getAuthUserId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No existe entrenador vinculado al usuario autenticado"));
            asistencia.setEntrenador(entrenador);
        }
        if (asistencia.getFechaAsistencia() == null) asistencia.setFechaAsistencia(LocalDate.now());
        if (asistencia.getHoraEntrada() == null) asistencia.setHoraEntrada(LocalTime.now());
        return repository.save(asistencia);
    }

    /** Actualiza una asistencia; solo ADMIN puede modificar registros. */
    public AsistenciaEntrenador actualizar(Integer id, AsistenciaEntrenador asistencia) {
        AuthContext.requireAdmin();
        asistencia.setIdAsistenciaEntrenador(id);
        return repository.save(asistencia);
    }

    /** Elimina una asistencia; solo ADMIN puede borrar registros. */
    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }
}
