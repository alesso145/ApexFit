package org.example.modules.entrenador.service;

import org.example.common.security.AuthContext;
import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.entrenador.dto.EntrenadorCuentaDTO;
import org.example.modules.entrenador.entity.Entrenador;
import org.example.modules.entrenador.repository.EntrenadorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Servicio transaccional de entrenadores y sus cuentas de acceso. */
@Service
public class EntrenadorService {
    private final EntrenadorRepository repository;
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    public EntrenadorService(EntrenadorRepository repository,
                             AuthUserRepository authUserRepository,
                             PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Entrenador> listar() {
        List<Entrenador> entrenadores;
        if (AuthContext.isAdmin()) {
            entrenadores = repository.findAll();
        } else {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username())
                    .map(AuthUser::getId).orElse(-1L);
            entrenadores = repository.findByAuthUserId(authUserId).map(List::of).orElse(List.of());
        }
        entrenadores.forEach(this::cargarUsername);
        return entrenadores;
    }

    public Entrenador buscarPorId(Integer id) {
        Entrenador entrenador = repository.findById(id).orElse(null);
        if (entrenador == null || AuthContext.isAdmin()) {
            if (entrenador != null) cargarUsername(entrenador);
            return entrenador;
        }
        Long authUserId = authUserRepository.findByUsername(AuthContext.username())
                .map(AuthUser::getId).orElse(-1L);
        if (!authUserId.equals(entrenador.getAuthUserId())) return null;
        cargarUsername(entrenador);
        return entrenador;
    }

    @Transactional
    public Entrenador guardar(EntrenadorCuentaDTO dto) {
        AuthContext.requireAdmin();
        if (limpiar(dto.getCedula()).isBlank() || limpiar(dto.getNombre()).isBlank()
                || limpiar(dto.getApellido()).isBlank() || limpiar(dto.getEspecialidad()).isBlank()) {
            throw new IllegalArgumentException("Cédula, nombre, apellido y especialidad son obligatorios");
        }
        String username = limpiar(dto.getUsername());
        String password = limpiar(dto.getPassword());
        validarCredencialesNuevas(username, password);

        AuthUser user = crearUsuario(username, password);
        Entrenador entrenador = new Entrenador();
        entrenador.setCedula(limpiar(dto.getCedula()));
        entrenador.setNombre(limpiar(dto.getNombre()));
        entrenador.setApellido(limpiar(dto.getApellido()));
        entrenador.setTelefono(limpiar(dto.getTelefono()));
        entrenador.setEspecialidad(limpiar(dto.getEspecialidad()));
        entrenador.setAuthUserId(user.getId());
        entrenador.setUsername(user.getUsername());
        return repository.save(entrenador);
    }

    @Transactional
    public Entrenador actualizar(Integer id, EntrenadorCuentaDTO dto) {
        AuthContext.requireAdmin();
        Entrenador entrenador = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrenador no encontrado: " + id));
        if (limpiar(dto.getCedula()).isBlank() || limpiar(dto.getNombre()).isBlank()
                || limpiar(dto.getApellido()).isBlank() || limpiar(dto.getEspecialidad()).isBlank()) {
            throw new IllegalArgumentException("Cédula, nombre, apellido y especialidad son obligatorios");
        }
        entrenador.setCedula(limpiar(dto.getCedula()));
        entrenador.setNombre(limpiar(dto.getNombre()));
        entrenador.setApellido(limpiar(dto.getApellido()));
        entrenador.setTelefono(limpiar(dto.getTelefono()));
        entrenador.setEspecialidad(limpiar(dto.getEspecialidad()));

        String username = limpiar(dto.getUsername());
        String password = limpiar(dto.getPassword());
        if (entrenador.getAuthUserId() == null) {
            if (!username.isBlank() || !password.isBlank()) {
                validarCredencialesNuevas(username, password);
                entrenador.setAuthUserId(crearUsuario(username, password).getId());
            }
        } else {
            AuthUser user = authUserRepository.findById(entrenador.getAuthUserId())
                    .orElseThrow(() -> new IllegalArgumentException("La cuenta asociada no existe"));
            if (!username.isBlank() && !username.equals(user.getUsername())) {
                if (authUserRepository.existsByUsernameAndIdNot(username, user.getId())) {
                    throw new IllegalArgumentException("El username ya está en uso");
                }
                user.setUsername(username);
            }
            if (!password.isBlank()) {
                if (password.length() < 6) throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
                user.setPassword(passwordEncoder.encode(password));
            }
            user.setRole("ENTRENADOR");
            authUserRepository.save(user);
        }
        cargarUsername(entrenador);
        return repository.save(entrenador);
    }

    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }

    private AuthUser crearUsuario(String username, String password) {
        AuthUser user = new AuthUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("ENTRENADOR");
        user.setActivo(true);
        return authUserRepository.save(user);
    }

    private void validarCredencialesNuevas(String username, String password) {
        if (username.isBlank()) throw new IllegalArgumentException("El username es obligatorio");
        if (password.length() < 6) throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        if (authUserRepository.existsByUsername(username)) throw new IllegalArgumentException("El username ya está en uso");
    }

    private void cargarUsername(Entrenador entrenador) {
        if (entrenador.getAuthUserId() != null) {
            authUserRepository.findById(entrenador.getAuthUserId()).ifPresent(u -> entrenador.setUsername(u.getUsername()));
        }
    }

    private String limpiar(String valor) { return valor == null ? "" : valor.trim(); }
}
