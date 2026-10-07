package org.example.modules.entrenador.controller;

import org.example.modules.entrenador.dto.EntrenadorCuentaDTO;
import org.example.modules.entrenador.entity.Entrenador;
import org.example.modules.entrenador.service.EntrenadorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints REST para entrenadores y sus cuentas de acceso. */
@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorController {
    private final EntrenadorService service;

    public EntrenadorController(EntrenadorService service) { this.service = service; }

    @GetMapping
    public List<Entrenador> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Entrenador buscarPorId(@PathVariable Integer id) { return service.buscarPorId(id); }

    @PostMapping
    public Entrenador guardar(@RequestBody EntrenadorCuentaDTO dto) { return service.guardar(dto); }

    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Integer id, @RequestBody EntrenadorCuentaDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) { service.eliminar(id); }
}
