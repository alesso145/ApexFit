package org.example.modules.producto.service;

import org.example.modules.producto.entity.Producto;
import org.example.modules.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;


/**
 * Documentación JavaDoc de la clase ProductoService.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.producto.service.ProductoService.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Servicio de negocio de APEX FIT responsable de procesar reglas y operaciones del módulo producto.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    public List<Producto> listar() {
        return repository.findAll();
    }

    public Producto buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public Producto guardar(Producto producto) {
        return repository.save(producto);
    }

    public Producto actualizar(Integer id, Producto producto) {
        producto.setIdProducto(id);
        return repository.save(producto);
    }

    public void eliminar(Integer id) {
        repository.deleteById(id);
    }

    /**
     * Registra un ingreso masivo de stock enviado por un proveedor externo mediante SOAP.
     * Si se recibe idProducto, actualiza ese producto. Si no existe id, busca por nombre.
     * Si tampoco existe por nombre, crea el producto con el stock recibido.
     *
     * @param idProducto identificador opcional del producto.
     * @param nombre nombre del producto enviado por el proveedor.
     * @param descripcion descripción opcional del producto.
     * @param precio precio unitario opcional.
     * @param cantidad cantidad de unidades a sumar al inventario.
     * @return producto creado o actualizado.
     */
    public Producto registrarIngresoStock(Integer idProducto, String nombre, String descripcion, BigDecimal precio, Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad de stock debe ser mayor a cero");
        }

        Producto producto = null;
        if (idProducto != null) {
            producto = repository.findById(idProducto).orElse(null);
        }
        if (producto == null && nombre != null && !nombre.isBlank()) {
            producto = repository.findByNombreIgnoreCase(nombre.trim()).orElse(null);
        }
        if (producto == null) {
            producto = new Producto();
            producto.setNombre(nombre == null || nombre.isBlank() ? "Producto proveedor" : nombre.trim());
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio == null ? BigDecimal.ZERO : precio);
            producto.setStock(0);
        }

        if (descripcion != null && !descripcion.isBlank()) producto.setDescripcion(descripcion);
        if (precio != null) producto.setPrecio(precio);
        producto.setStock((producto.getStock() == null ? 0 : producto.getStock()) + cantidad);
        return repository.save(producto);
    }

}
