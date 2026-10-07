package org.example.modules.membresia.controller;

import org.example.modules.membresia.entity.Membresia;
import org.example.modules.membresia.service.MembresiaService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


/**
 * Documentación JavaDoc de la clase MembresiaController.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.membresia.controller.MembresiaController.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Controlador REST de APEX FIT que expone endpoints HTTP para el módulo membresia.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/membresias")
public class MembresiaController {

    private final MembresiaService service;

    public MembresiaController(MembresiaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Membresia> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Membresia buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public Membresia guardar(@RequestBody Membresia membresia) {
        return service.guardar(membresia);
    }

    @PutMapping("/{id}")
    public Membresia actualizar(@PathVariable Integer id, @RequestBody Membresia membresia) {
        return service.actualizar(id, membresia);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
