package org.example.modules.asistenciaentrenador.repository;

import org.example.modules.asistenciaentrenador.entity.AsistenciaEntrenador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repositorio JPA encargado de consultar y persistir asistencias de entrenadores.
 *
 * <p>Incluye búsqueda por usuario autenticado para que cada entrenador vea solo
 * sus propios registros, mientras que el administrador puede visualizar todo.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
public interface AsistenciaEntrenadorRepository extends JpaRepository<AsistenciaEntrenador, Integer> {
    List<AsistenciaEntrenador> findByEntrenadorAuthUserId(Long authUserId);
}
