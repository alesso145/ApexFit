package org.example.modules.asistencia.repository;

import org.example.modules.asistencia.entity.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


/**
 * Documentación JavaDoc de la clase AsistenciaRepository.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.asistencia.repository.AsistenciaRepository.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Repositorio JPA encargado del acceso a datos para el módulo asistencia.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
public interface AsistenciaRepository extends JpaRepository<Asistencia, Integer> {
    List<Asistencia> findByClienteAuthUserId(Long authUserId);
    List<Asistencia> findByClaseEntrenadorAuthUserId(Long authUserId);
}
