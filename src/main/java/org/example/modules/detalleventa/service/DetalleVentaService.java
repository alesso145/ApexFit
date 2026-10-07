package org.example.modules.detalleventa.service;

import org.example.modules.detalleventa.entity.DetalleVenta;
import org.example.modules.detalleventa.repository.DetalleVentaRepository;
import org.springframework.stereotype.Service;
import java.util.List;


/**
 * Documentación JavaDoc de la clase DetalleVentaService.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.detalleventa.service.DetalleVentaService.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Servicio de negocio de APEX FIT responsable de procesar reglas y operaciones del módulo detalleventa.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Service
public class DetalleVentaService {

    private final DetalleVentaRepository repository;

    public DetalleVentaService(DetalleVentaRepository repository) {
        this.repository = repository;
    }

    public List<DetalleVenta> listar() {
        return repository.findAll();
    }

    public DetalleVenta buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public DetalleVenta guardar(DetalleVenta detalleVenta) {
        return repository.save(detalleVenta);
    }

    public DetalleVenta actualizar(Integer id, DetalleVenta detalleVenta) {
        detalleVenta.setIdDetalle(id);
        return repository.save(detalleVenta);
    }

    public void eliminar(Integer id) {
        repository.deleteById(id);
    }
}
