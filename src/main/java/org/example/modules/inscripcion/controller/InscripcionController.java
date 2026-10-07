package org.example.modules.inscripcion.controller;

import org.example.modules.inscripcion.entity.Inscripcion;
import org.example.modules.inscripcion.service.InscripcionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


/**
 * Documentación JavaDoc de la clase InscripcionController.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.inscripcion.controller.InscripcionController.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Controlador REST de APEX FIT que expone endpoints HTTP para el módulo inscripcion.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/inscripciones")
public class InscripcionController {

    private final InscripcionService service;

    public InscripcionController(InscripcionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Inscripcion> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Inscripcion buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Inscripcion guardar(@RequestBody Inscripcion inscripcion) {
        return service.guardar(inscripcion);
    }

    @PutMapping("/{id}")
    public Inscripcion actualizar(@PathVariable Integer id, @RequestBody Inscripcion inscripcion) {
        return service.actualizar(id, inscripcion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
