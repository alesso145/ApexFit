package org.example.modules.asistencia.controller;

import org.example.modules.asistencia.entity.Asistencia;
import org.example.modules.asistencia.service.AsistenciaService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


/**
 * Documentación JavaDoc de la clase AsistenciaController.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.asistencia.controller.AsistenciaController.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Controlador REST de APEX FIT que expone endpoints HTTP para el módulo asistencia.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService service;

    public AsistenciaController(AsistenciaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Asistencia> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Asistencia buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Asistencia guardar(@RequestBody Asistencia asistencia) {
        return service.guardar(asistencia);
    }

    @PutMapping("/{id}")
    public Asistencia actualizar(@PathVariable Integer id, @RequestBody Asistencia asistencia) {
        return service.actualizar(id, asistencia);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
