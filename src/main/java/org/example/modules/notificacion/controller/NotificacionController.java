package org.example.modules.notificacion.controller;

import org.example.common.security.AuthContext;
import org.example.modules.notificacion.entity.Notificacion;
import org.example.modules.notificacion.service.NotificacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints de notificaciones: cada usuario solo ve y gestiona las suyas. */
@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notificacion> listar() {
        return service.listar(AuthContext.username());
    }

    @PostMapping("/{id}/leer")
    public void marcarLeida(@PathVariable Long id) {
        service.marcarLeida(id, AuthContext.username());
    }

    @PostMapping("/leer-todas")
    public void marcarTodasLeidas() {
        service.marcarTodasLeidas(AuthContext.username());
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id, AuthContext.username());
    }

    @DeleteMapping
    public void eliminarTodas() {
        service.eliminarTodas(AuthContext.username());
    }
}
