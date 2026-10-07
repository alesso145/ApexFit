package org.example.modules.pago.controller;

import org.example.modules.inscripcion.entity.Inscripcion;
import org.example.modules.inscripcion.repository.InscripcionRepository;
import org.example.modules.pago.dto.PagoDTO;
import org.example.modules.pago.entity.Pago;
import org.example.modules.pago.service.PagoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints REST para consulta y registro manual de pagos de membresías. */
@RestController
@RequestMapping("/api/pagos")
public class PagoController {
    private final PagoService service;
    private final InscripcionRepository inscripcionRepository;

    public PagoController(PagoService service, InscripcionRepository inscripcionRepository) {
        this.service = service;
        this.inscripcionRepository = inscripcionRepository;
    }

    @GetMapping
    public List<Pago> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Pago buscarPorId(@PathVariable Integer id) { return service.buscarPorId(id); }

    /** Solo permite crear pagos de una inscripción/membresía. */
    @PostMapping
    public Pago guardar(@RequestBody PagoDTO dto) {
        Inscripcion inscripcion = inscripcionRepository.findById(dto.getInscripcionId())
                .orElseThrow(() -> new IllegalArgumentException("La inscripción no existe"));
        Pago pago = new Pago();
        pago.setInscripcion(inscripcion);
        pago.setTipoPago("MEMBRESIA");
        pago.setMonto(dto.getMonto());
        pago.setFechaPago(dto.getFechaPago());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setEstado(dto.getEstado());
        return service.guardar(pago);
    }

    @PutMapping("/{id}")
    public Pago actualizar(@PathVariable Integer id, @RequestBody PagoDTO dto) {
        Inscripcion inscripcion = inscripcionRepository.findById(dto.getInscripcionId())
                .orElseThrow(() -> new IllegalArgumentException("La inscripción no existe"));
        Pago pago = new Pago();
        pago.setInscripcion(inscripcion);
        pago.setTipoPago("MEMBRESIA");
        pago.setMonto(dto.getMonto());
        pago.setFechaPago(dto.getFechaPago());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setEstado(dto.getEstado());
        return service.actualizar(id, pago);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) { service.eliminar(id); }
}
