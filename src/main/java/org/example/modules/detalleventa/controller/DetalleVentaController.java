package org.example.modules.detalleventa.controller;

import org.example.modules.detalleventa.entity.DetalleVenta;
import org.example.modules.detalleventa.service.DetalleVentaService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


/**
 * Documentación JavaDoc de la clase DetalleVentaController.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.detalleventa.controller.DetalleVentaController.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Controlador REST de APEX FIT que expone endpoints HTTP para el módulo detalleventa.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@RestController
@RequestMapping("/api/detalles-venta")
public class DetalleVentaController {

    private final DetalleVentaService service;

    public DetalleVentaController(DetalleVentaService service) {
        this.service = service;
    }

    @GetMapping
    public List<DetalleVenta> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public DetalleVenta buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public DetalleVenta guardar(@RequestBody DetalleVenta detalleVenta) {
        return service.guardar(detalleVenta);
    }

    @PutMapping("/{id}")
    public DetalleVenta actualizar(@PathVariable Integer id, @RequestBody DetalleVenta detalleVenta) {
        return service.actualizar(id, detalleVenta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
