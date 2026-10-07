package org.example.modules.asistenciaentrenador.controller;

import org.example.modules.asistenciaentrenador.entity.AsistenciaEntrenador;
import org.example.modules.asistenciaentrenador.service.AsistenciaEntrenadorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para registrar y consultar asistencias de entrenadores.
 *
 * <p>Expone endpoints para que el administrador pueda controlar todos los registros
 * y para que cada entrenador pueda registrar su propia asistencia a las clases que dicta.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/asistencias-entrenadores")
public class AsistenciaEntrenadorController {

    private final AsistenciaEntrenadorService service;

    public AsistenciaEntrenadorController(AsistenciaEntrenadorService service) {
        this.service = service;
    }

    /** Lista asistencias de entrenadores, filtradas por rol. */
    @GetMapping
    public List<AsistenciaEntrenador> listar() {
        return service.listar();
    }

    /** Busca una asistencia de entrenador por id. */
    @GetMapping("/{id}")
    public AsistenciaEntrenador buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    /** Registra una nueva asistencia de entrenador. */
    @PostMapping
    public AsistenciaEntrenador guardar(@RequestBody AsistenciaEntrenador asistencia) {
        return service.guardar(asistencia);
    }

    /** Actualiza una asistencia de entrenador; operación para ADMIN. */
    @PutMapping("/{id}")
    public AsistenciaEntrenador actualizar(@PathVariable Integer id, @RequestBody AsistenciaEntrenador asistencia) {
        return service.actualizar(id, asistencia);
    }

    /** Elimina una asistencia de entrenador; operación para ADMIN. */
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
