package org.example.modules.membresia.service;

import org.example.modules.membresia.entity.Membresia;
import org.example.modules.membresia.repository.MembresiaRepository;
import org.springframework.stereotype.Service;
import java.util.List;


/**
 * Documentación JavaDoc de la clase MembresiaService.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.membresia.service.MembresiaService.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Servicio de negocio de APEX FIT responsable de procesar reglas y operaciones del módulo membresia.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Service
public class MembresiaService {

    private final MembresiaRepository repository;

    public MembresiaService(MembresiaRepository repository) {
        this.repository = repository;
    }

    public List<Membresia> listar() {
        return repository.findAll();
    }

    public Membresia buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public Membresia guardar(Membresia membresia) {
        return repository.save(membresia);
    }

    public Membresia actualizar(Integer id, Membresia membresia) {
        membresia.setIdMembresia(id);
        return repository.save(membresia);
    }

    public void eliminar(Integer id) {
        repository.deleteById(id);
    }
}
