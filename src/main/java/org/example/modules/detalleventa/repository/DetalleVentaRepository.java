package org.example.modules.detalleventa.repository;

import org.example.modules.detalleventa.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;


/**
 * Documentación JavaDoc de la clase DetalleVentaRepository.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.detalleventa.repository.DetalleVentaRepository.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Repositorio JPA encargado del acceso a datos para el módulo detalleventa.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {
}
