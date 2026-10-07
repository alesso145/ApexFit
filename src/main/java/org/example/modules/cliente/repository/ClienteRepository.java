package org.example.modules.cliente.repository;

import org.example.modules.cliente.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


/**
 * Documentación JavaDoc de la clase ClienteRepository.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.cliente.repository.ClienteRepository.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Repositorio JPA encargado del acceso a datos para el módulo cliente.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByAuthUserId(Long authUserId);
}
