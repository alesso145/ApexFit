package org.example.modules.pago.repository;

import org.example.modules.pago.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


/**
 * Documentación JavaDoc de la clase PagoRepository.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.pago.repository.PagoRepository.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Repositorio JPA encargado del acceso a datos para el módulo pago.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    @Query("""
            SELECT p FROM Pago p
            LEFT JOIN p.inscripcion i
            LEFT JOIN i.cliente ci
            LEFT JOIN p.venta v
            LEFT JOIN v.cliente cv
            WHERE ci.authUserId = :authUserId OR cv.authUserId = :authUserId
            """)
    List<Pago> findPagosDelClienteAutenticado(@Param("authUserId") Long authUserId);
}
