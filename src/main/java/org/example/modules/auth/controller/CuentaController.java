package org.example.modules.auth.controller;

import jakarta.validation.Valid;
import org.example.common.security.AuthContext;
import org.example.modules.auth.dto.CambiarClaveRequest;
import org.example.modules.auth.service.CuentaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Operaciones de la cuenta del usuario autenticado (requiere sesión). */
@RestController
@RequestMapping("/api/cuenta")
public class CuentaController {

    private final CuentaService service;

    public CuentaController(CuentaService service) {
        this.service = service;
    }

    @PostMapping("/cambiar-clave")
    public ResponseEntity<Map<String, String>> cambiarClave(@Valid @RequestBody CambiarClaveRequest request) {
        service.cambiarClave(AuthContext.username(), request.getClaveActual(), request.getNuevaClave());
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente."));
    }
}
