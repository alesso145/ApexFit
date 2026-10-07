package org.example.modules.venta.controller;

import org.example.modules.venta.dto.VentaPOSDTO;
import org.example.modules.venta.entity.Venta;
import org.example.modules.venta.service.VentaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {
    private final VentaService service;

    public VentaController(VentaService service) { this.service = service; }

    @GetMapping
    public List<Venta> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Venta buscarPorId(@PathVariable Integer id) { return service.buscarPorId(id); }

    @PostMapping
    public Venta guardar(@RequestBody Venta venta) { return service.guardar(venta); }

    /** Endpoint único para checkout completo del POS. */
    @PostMapping("/checkout")
    public Venta completarCompra(@RequestBody VentaPOSDTO request) {
        return service.completarCompra(request);
    }

    @PutMapping("/{id}")
    public Venta actualizar(@PathVariable Integer id, @RequestBody Venta venta) {
        return service.actualizar(id, venta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) { service.eliminar(id); }
}
