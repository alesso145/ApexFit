package org.example.modules.clase.controller;

import org.example.modules.clase.entity.Clase;
import org.example.modules.clase.service.ClaseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


/**
 * Documentación JavaDoc de la clase ClaseController.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.clase.controller.ClaseController.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Controlador REST de APEX FIT que expone endpoints HTTP para el módulo clase.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/clases")
public class ClaseController {

    private final ClaseService service;

    public ClaseController(ClaseService service) {
        this.service = service;
    }

    @GetMapping
    public List<Clase> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Clase buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Clase guardar(@RequestBody Clase clase) {
        return service.guardar(clase);
    }

    @PutMapping("/{id}")
    public Clase actualizar(@PathVariable Integer id, @RequestBody Clase clase) {
        return service.actualizar(id, clase);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
