package org.example.modules.clase.service;

import org.example.common.security.AuthContext;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.clase.entity.Clase;
import org.example.modules.clase.repository.ClaseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/** Servicio de clases/salas. Admin ve todo; entrenador ve solo sus clases. */
@Service
public class ClaseService {

    private final ClaseRepository repository;
    private final AuthUserRepository authUserRepository;

    public ClaseService(ClaseRepository repository, AuthUserRepository authUserRepository) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
    }

    public List<Clase> listar() {
        if (AuthContext.isEntrenador()) {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username()).map(u -> u.getId()).orElse(-1L);
            return repository.findByEntrenadorAuthUserId(authUserId);
        }
        return repository.findAll();
    }

    public Clase buscarPorId(Integer id) { return repository.findById(id).orElse(null); }
    public Clase guardar(Clase clase) { return repository.save(clase); }

    public Clase actualizar(Integer id, Clase clase) {
        AuthContext.requireAdmin();
        clase.setIdClase(id);
        return repository.save(clase);
    }

    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }
}
