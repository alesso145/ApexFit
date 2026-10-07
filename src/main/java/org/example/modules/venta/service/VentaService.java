package org.example.modules.venta.service;

import org.example.exception.BusinessException;
import org.example.modules.cliente.entity.Cliente;
import org.example.modules.cliente.repository.ClienteRepository;
import org.example.modules.detalleventa.entity.DetalleVenta;
import org.example.modules.detalleventa.repository.DetalleVentaRepository;
import org.example.common.security.AuthContext;
import org.example.modules.notificacion.service.NotificacionService;
import org.example.modules.pago.entity.Pago;
import org.example.modules.pago.repository.PagoRepository;
import org.example.modules.producto.entity.Producto;
import org.example.modules.producto.repository.ProductoRepository;
import org.example.modules.venta.dto.VentaPOSDTO;
import org.example.modules.venta.entity.Venta;
import org.example.modules.venta.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Servicio de ventas. El checkout POS se ejecuta en una sola transacción. */
@Service
public class VentaService {
    private final VentaRepository repository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final PagoRepository pagoRepository;
    private final NotificacionService notificaciones;

    public VentaService(VentaRepository repository,
                        ClienteRepository clienteRepository,
                        ProductoRepository productoRepository,
                        DetalleVentaRepository detalleVentaRepository,
                        PagoRepository pagoRepository,
                        NotificacionService notificaciones) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.pagoRepository = pagoRepository;
        this.notificaciones = notificaciones;
    }

    public List<Venta> listar() { return repository.findAll(); }
    public Venta buscarPorId(Integer id) { return repository.findById(id).orElse(null); }
    public Venta guardar(Venta venta) { return repository.save(venta); }

    public Venta actualizar(Integer id, Venta venta) {
        venta.setIdVenta(id);
        return repository.save(venta);
    }

    public void eliminar(Integer id) { repository.deleteById(id); }

    /**
     * Completa una compra: valida cliente, bloquea stock, guarda venta y detalles,
     * descuenta inventario y crea automáticamente el pago PRODUCTO.
     * Si cualquier paso falla, toda la transacción se revierte.
     */
    @Transactional
    public Venta completarCompra(VentaPOSDTO request) {
        validarRequest(request);
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new BusinessException("El cliente seleccionado no existe"));

        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setFechaVenta(LocalDate.now());
        venta.setTotal(BigDecimal.ZERO);
        venta = repository.save(venta);

        BigDecimal total = BigDecimal.ZERO;
        for (VentaPOSDTO.ItemDTO item : request.getItems()) {
            if (item.getProductoId() == null || item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new BusinessException("Cada producto debe tener un ID y una cantidad mayor a cero");
            }

            Producto producto = productoRepository.findByIdForUpdate(item.getProductoId())
                    .orElseThrow(() -> new BusinessException("Producto no encontrado: " + item.getProductoId()));
            int stock = producto.getStock() == null ? 0 : producto.getStock();
            if (stock < item.getCantidad()) {
                throw new BusinessException("Stock insuficiente para: " + producto.getNombre());
            }

            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);
            detalleVentaRepository.save(detalle);

            producto.setStock(stock - item.getCantidad());
            productoRepository.save(producto);
            total = total.add(subtotal);
        }

        venta.setTotal(total);
        venta = repository.save(venta);

        Pago pago = new Pago();
        pago.setVenta(venta);
        pago.setTipoPago("PRODUCTO");
        pago.setMonto(total);
        pago.setFechaPago(LocalDate.now());
        pago.setMetodoPago(normalizarMetodoPago(request.getMetodoPago()));
        pago.setEstado("Completado");
        pagoRepository.save(pago);

        try {
            notificarVenta(venta, cliente, total, pago.getMetodoPago());
        } catch (Exception ignored) {
            // La notificación nunca debe revertir una venta ya completada.
        }
        return venta;
    }

    /** Avisa al administrador (y al cliente) de una nueva venta del POS. */
    private void notificarVenta(Venta venta, Cliente cliente, BigDecimal total, String metodo) {
        String nombre = cliente.getNombre() + " " + cliente.getApellido();
        if (!AuthContext.isAdmin()) {
            notificaciones.notificarAdmins("VENTA", "Nueva venta en el POS",
                    "Venta #" + venta.getIdVenta() + " de $" + total + " (" + metodo + ") realizada por " + nombre
                            + ". El recibo está disponible en Pagos.");
        } else {
            notificaciones.notificarAdmins("VENTA", "Venta registrada",
                    "Venta #" + venta.getIdVenta() + " de $" + total + " (" + metodo + ") a " + nombre
                            + ". Puedes imprimir el recibo en Pagos.");
        }
        notificaciones.notificarPorAuthUserId(cliente.getAuthUserId(), "VENTA", "Compra registrada",
                "Tu compra #" + venta.getIdVenta() + " por $" + total + " fue registrada con pago " + metodo + ".");
    }

    private void validarRequest(VentaPOSDTO request) {
        if (request == null || request.getClienteId() == null) {
            throw new BusinessException("Debe seleccionar un cliente");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("El carrito no puede estar vacío");
        }
        normalizarMetodoPago(request.getMetodoPago());
    }

    private String normalizarMetodoPago(String metodoPago) {
        String metodo = metodoPago == null ? "" : metodoPago.trim().toUpperCase();
        return switch (metodo) {
            case "EFECTIVO" -> "EFECTIVO";
            case "TRANSFERENCIA" -> "TRANSFERENCIA";
            case "TARJETA" -> "TARJETA";
            default -> throw new BusinessException("Método de pago no válido. Use EFECTIVO, TRANSFERENCIA o TARJETA");
        };
    }
}
