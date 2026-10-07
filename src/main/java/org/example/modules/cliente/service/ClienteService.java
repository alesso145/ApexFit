package org.example.modules.cliente.service;

import org.example.common.security.AuthContext;
import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.cliente.dto.ClienteCuentaDTO;
import org.example.modules.cliente.entity.Cliente;
import org.example.modules.cliente.repository.ClienteRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/** Servicio transaccional de clientes y creación de sus cuentas de acceso. */
@Service
public class ClienteService {
    private final ClienteRepository repository;
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    public ClienteService(ClienteRepository repository,
                          AuthUserRepository authUserRepository,
                          PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Cliente> listar() {
        List<Cliente> clientes;
        if (AuthContext.isAdmin()) {
            clientes = repository.findAll();
        } else {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username())
                    .map(AuthUser::getId).orElse(-1L);
            clientes = repository.findByAuthUserId(authUserId).map(List::of).orElse(List.of());
        }
        clientes.forEach(this::cargarUsername);
        return clientes;
    }

    public Cliente buscarPorId(Integer id) {
        Cliente cliente = repository.findById(id).orElse(null);
        if (cliente == null || AuthContext.isAdmin()) {
            if (cliente != null) cargarUsername(cliente);
            return cliente;
        }
        Long authUserId = authUserRepository.findByUsername(AuthContext.username())
                .map(AuthUser::getId).orElse(-1L);
        if (!authUserId.equals(cliente.getAuthUserId())) return null;
        cargarUsername(cliente);
        return cliente;
    }

    @Transactional
    public Cliente guardar(ClienteCuentaDTO dto) {
        AuthContext.requireAdmin();
        validarDatosBasicos(dto.getCedula(), dto.getNombre(), dto.getApellido());
        String username = limpiar(dto.getUsername());
        String password = limpiar(dto.getPassword());
        validarCredencialesNuevas(username, password);

        AuthUser user = crearUsuario(username, password, "CLIENTE");
        Cliente cliente = new Cliente();
        cliente.setCedula(limpiar(dto.getCedula()));
        cliente.setNombre(limpiar(dto.getNombre()));
        cliente.setApellido(limpiar(dto.getApellido()));
        cliente.setTelefono(limpiar(dto.getTelefono()));
        cliente.setCorreo(limpiar(dto.getCorreo()));
        cliente.setFechaRegistro(LocalDate.now());
        cliente.setEstado(dto.getEstado() == null || dto.getEstado());
        cliente.setAuthUserId(user.getId());
        cliente.setUsername(user.getUsername());
        return repository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(Integer id, ClienteCuentaDTO dto) {
        AuthContext.requireAdmin();
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado: " + id));

        validarDatosBasicos(dto.getCedula(), dto.getNombre(), dto.getApellido());

        cliente.setCedula(limpiar(dto.getCedula()));
        cliente.setNombre(limpiar(dto.getNombre()));
        cliente.setApellido(limpiar(dto.getApellido()));
        cliente.setTelefono(limpiar(dto.getTelefono()));
        cliente.setCorreo(limpiar(dto.getCorreo()));
        cliente.setEstado(dto.getEstado() == null || dto.getEstado());
        if (cliente.getFechaRegistro() == null) cliente.setFechaRegistro(LocalDate.now());

        Long nuevoAuthUserId = actualizarCredenciales(cliente.getAuthUserId(), dto.getUsername(), dto.getPassword(), "CLIENTE");
        if (cliente.getAuthUserId() == null && nuevoAuthUserId != null) {
            cliente.setAuthUserId(nuevoAuthUserId);
        }
        cargarUsername(cliente);
        return repository.save(cliente);
    }

    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }

    private AuthUser crearUsuario(String username, String password, String role) {
        AuthUser user = new AuthUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActivo(true);
        return authUserRepository.save(user);
    }

    private Long actualizarCredenciales(Long authUserId, String username, String password, String role) {
        String nuevoUsername = limpiar(username);
        String nuevaPassword = limpiar(password);
        if (authUserId == null) {
            if (nuevoUsername.isBlank() && nuevaPassword.isBlank()) return null;
            validarCredencialesNuevas(nuevoUsername, nuevaPassword);
            return crearUsuario(nuevoUsername, nuevaPassword, role).getId();
        }

        AuthUser user = authUserRepository.findById(authUserId)
                .orElseThrow(() -> new IllegalArgumentException("La cuenta asociada no existe"));
        if (!nuevoUsername.isBlank() && !nuevoUsername.equals(user.getUsername())) {
            if (authUserRepository.existsByUsernameAndIdNot(nuevoUsername, user.getId())) {
                throw new IllegalArgumentException("El username ya está en uso");
            }
            user.setUsername(nuevoUsername);
        }
        if (!nuevaPassword.isBlank()) {
            if (nuevaPassword.length() < 6) throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
            user.setPassword(passwordEncoder.encode(nuevaPassword));
        }
        user.setRole(role);
        authUserRepository.save(user);
        return user.getId();
    }

    private void cargarUsername(Cliente cliente) {
        if (cliente.getAuthUserId() != null) {
            authUserRepository.findById(cliente.getAuthUserId()).ifPresent(u -> cliente.setUsername(u.getUsername()));
        }
    }

    private void validarCredencialesNuevas(String username, String password) {
        if (username.isBlank()) throw new IllegalArgumentException("El username es obligatorio");
        if (password.length() < 6) throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        if (authUserRepository.existsByUsername(username)) throw new IllegalArgumentException("El username ya está en uso");
    }

    private void validarDatosBasicos(String cedula, String nombre, String apellido) {
        if (limpiar(cedula).isBlank() || limpiar(nombre).isBlank() || limpiar(apellido).isBlank()) {
            throw new IllegalArgumentException("Cédula, nombre y apellido son obligatorios");
        }
    }

    private String limpiar(String valor) { return valor == null ? "" : valor.trim(); }
}
