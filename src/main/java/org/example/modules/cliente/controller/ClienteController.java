package org.example.modules.cliente.controller;

import org.example.modules.cliente.dto.ClienteCuentaDTO;
import org.example.modules.cliente.entity.Cliente;
import org.example.modules.cliente.service.ClienteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints REST para clientes y sus cuentas de acceso. */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteService service;

    public ClienteController(ClienteService service) { this.service = service; }

    @GetMapping
    public List<Cliente> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Integer id) { return service.buscarPorId(id); }

    @PostMapping
    public Cliente guardar(@RequestBody ClienteCuentaDTO dto) { return service.guardar(dto); }

    @PutMapping("/{id}")
    public Cliente actualizar(@PathVariable Integer id, @RequestBody ClienteCuentaDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) { service.eliminar(id); }
}
