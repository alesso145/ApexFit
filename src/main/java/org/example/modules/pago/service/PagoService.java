package org.example.modules.pago.service;

import org.example.common.security.AuthContext;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.pago.entity.Pago;
import org.example.modules.pago.repository.PagoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Servicio de pagos. Los cobros manuales de este módulo son exclusivamente de membresías. */
@Service
public class PagoService {
    private final PagoRepository repository;
    private final AuthUserRepository authUserRepository;

    public PagoService(PagoRepository repository, AuthUserRepository authUserRepository) {
        this.repository = repository;
        this.authUserRepository = authUserRepository;
    }

    public List<Pago> listar() {
        if (AuthContext.isCliente()) {
            Long authUserId = authUserRepository.findByUsername(AuthContext.username()).map(u -> u.getId()).orElse(-1L);
            return repository.findPagosDelClienteAutenticado(authUserId);
        }
        return repository.findAll();
    }

    public Pago buscarPorId(Integer id) { return repository.findById(id).orElse(null); }

    public Pago guardar(Pago pago) {
        if (pago == null || pago.getInscripcion() == null) {
            throw new IllegalArgumentException("El módulo de Pagos solo permite registrar cobros de membresías");
        }
        pago.setTipoPago("MEMBRESIA");
        pago.setVenta(null);
        return repository.save(pago);
    }

    public Pago actualizar(Integer id, Pago pago) {
        AuthContext.requireAdmin();
        if (pago == null || pago.getInscripcion() == null) {
            throw new IllegalArgumentException("El módulo de Pagos solo permite registrar cobros de membresías");
        }
        pago.setIdPago(id);
        pago.setTipoPago("MEMBRESIA");
        pago.setVenta(null);
        return repository.save(pago);
    }

    public void eliminar(Integer id) {
        AuthContext.requireAdmin();
        repository.deleteById(id);
    }
}
