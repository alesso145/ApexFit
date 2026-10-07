package org.example.modules.auth.service;

import org.example.modules.asistencia.entity.Asistencia;
import org.example.modules.asistencia.repository.AsistenciaRepository;
import org.example.modules.auth.entity.AuthUser;
import org.example.modules.auth.repository.AuthUserRepository;
import org.example.modules.clase.entity.Clase;
import org.example.modules.clase.repository.ClaseRepository;
import org.example.modules.cliente.entity.Cliente;
import org.example.modules.cliente.repository.ClienteRepository;
import org.example.modules.detalleventa.entity.DetalleVenta;
import org.example.modules.detalleventa.repository.DetalleVentaRepository;
import org.example.modules.entrenador.entity.Entrenador;
import org.example.modules.entrenador.repository.EntrenadorRepository;
import org.example.modules.inscripcion.entity.Inscripcion;
import org.example.modules.inscripcion.repository.InscripcionRepository;
import org.example.modules.membresia.entity.Membresia;
import org.example.modules.notificacion.entity.Notificacion;
import org.example.modules.notificacion.repository.NotificacionRepository;
import org.example.modules.membresia.repository.MembresiaRepository;
import org.example.modules.pago.entity.Pago;
import org.example.modules.pago.repository.PagoRepository;
import org.example.modules.producto.entity.Producto;
import org.example.modules.producto.repository.ProductoRepository;
import org.example.modules.venta.entity.Venta;
import org.example.modules.venta.repository.VentaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Carga datos iniciales para que el frontend no aparezca vacío en una instalación nueva.
 *
 * <p>También corrige usuarios existentes creados en pgAdmin con contraseña en texto plano,
 * dejando las claves cifradas con BCrypt para que el login funcione correctamente.</p>
 */

/**
 * Documentación JavaDoc de la clase DataInitializer.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.auth.service.DataInitializer.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Servicio de negocio de APEX FIT responsable de procesar reglas y operaciones del módulo auth.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClienteRepository clienteRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final MembresiaRepository membresiaRepository;
    private final ClaseRepository claseRepository;
    private final InscripcionRepository inscripcionRepository;
    private final PagoRepository pagoRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final NotificacionRepository notificacionRepository;

    public DataInitializer(AuthUserRepository authUserRepository,
                           PasswordEncoder passwordEncoder,
                           ClienteRepository clienteRepository,
                           EntrenadorRepository entrenadorRepository,
                           MembresiaRepository membresiaRepository,
                           ClaseRepository claseRepository,
                           InscripcionRepository inscripcionRepository,
                           PagoRepository pagoRepository,
                           AsistenciaRepository asistenciaRepository,
                           ProductoRepository productoRepository,
                           VentaRepository ventaRepository,
                           DetalleVentaRepository detalleVentaRepository,
                           NotificacionRepository notificacionRepository) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.clienteRepository = clienteRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.membresiaRepository = membresiaRepository;
        this.claseRepository = claseRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.pagoRepository = pagoRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.productoRepository = productoRepository;
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.notificacionRepository = notificacionRepository;
    }

    @Override
    public void run(String... args) {
        crearOActualizarUsuario("admin", "123456", "ADMIN");
        crearOActualizarUsuario("proveedor", "123456", "PROVEEDOR");
        crearOActualizarUsuario("cliente", "123456", "CLIENTE");
        crearOActualizarUsuario("entrenador", "123456", "ENTRENADOR");

        crearOActualizarUsuario("javier", "123456", "CLIENTE");
        crearOActualizarUsuario("ana", "123456", "CLIENTE");
        crearOActualizarUsuario("diego", "123456", "CLIENTE");
        crearOActualizarUsuario("maria", "123456", "CLIENTE");
        crearOActualizarUsuario("kevin", "123456", "CLIENTE");

        crearOActualizarUsuario("pedro", "123456", "ENTRENADOR");
        crearOActualizarUsuario("sofia", "123456", "ENTRENADOR");
        crearOActualizarUsuario("andres", "123456", "ENTRENADOR");
        crearOActualizarUsuario("luis", "123456", "ENTRENADOR");
        crearOActualizarUsuario("gabriela", "123456", "ENTRENADOR");

        cargarDatosDemoSiLaBaseEstaVacia();
        vincularUsuariosConPersonasExistentes();
        crearNotificacionBienvenida();
    }

    /** Deja un aviso de bienvenida a los usuarios que aún no tienen ninguna notificación. */
    private void crearNotificacionBienvenida() {
        for (AuthUser u : authUserRepository.findAll()) {
            if (!notificacionRepository.findTop50ByDestinatarioOrderByFechaDescIdNotificacionDesc(u.getUsername()).isEmpty()) continue;
            Notificacion n = new Notificacion();
            n.setDestinatario(u.getUsername());
            n.setTipo("INFO");
            n.setTitulo("¡Bienvenido a APEX FIT!");
            n.setMensaje("Aquí recibirás avisos de ventas, inscripciones a clases y cambios de seguridad de tu cuenta.");
            notificacionRepository.save(n);
        }
    }

    /**
     * Crea o actualiza usuarios de prueba con contraseña cifrada.
     */
    private void crearOActualizarUsuario(String username, String password, String role) {
        AuthUser user = authUserRepository.findByUsername(username).orElseGet(AuthUser::new);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActivo(true);
        authUserRepository.save(user);
    }


    /**
     * Vincula cada cliente y entrenador con su usuario de login para que los roles CLIENTE
     * y ENTRENADOR solo vean su propia información.
     */
    private void vincularUsuariosConPersonasExistentes() {
        clienteRepository.findAll().forEach(cliente -> {
            String username = normalizar(cliente.getNombre());
            authUserRepository.findByUsername(username).ifPresent(user -> {
                cliente.setAuthUserId(user.getId());
                clienteRepository.save(cliente);
            });
        });

        entrenadorRepository.findAll().forEach(entrenador -> {
            String username = normalizar(entrenador.getNombre());
            authUserRepository.findByUsername(username).ifPresent(user -> {
                entrenador.setAuthUserId(user.getId());
                entrenadorRepository.save(entrenador);
            });
        });
    }

    private String normalizar(String texto) {
        if (texto == null) return "";
        return texto.trim().toLowerCase()
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u")
                .replace("ñ", "n");
    }

    /**
     * Inserta clientes, entrenadores, membresías, clases, pagos, productos y ventas
     * solamente cuando la base principal está vacía.
     */
    private void cargarDatosDemoSiLaBaseEstaVacia() {
        if (clienteRepository.count() > 0 || entrenadorRepository.count() > 0 || membresiaRepository.count() > 0) {
            return;
        }

        Entrenador e1 = entrenador("1712345678", "Pedro", "Ramírez", "0981111111", "Musculación");
        Entrenador e2 = entrenador("1723456789", "Sofía", "Vera", "0982222222", "Crossfit");
        Entrenador e3 = entrenador("1734567890", "Andrés", "Mora", "0983333333", "Cardio");
        Entrenador e4 = entrenador("1745678901", "Luis", "Paredes", "0984444444", "Spinning");
        Entrenador e5 = entrenador("1756789012", "Gabriela", "Salazar", "0985555555", "Yoga");
        entrenadorRepository.saveAll(List.of(e1, e2, e3, e4, e5));

        Cliente c1 = cliente("1750011122", "Javier", "Cabrera", "0991112233", "javier@gmail.com");
        Cliente c2 = cliente("1750022233", "Ana", "Mena", "0982223344", "ana@gmail.com");
        Cliente c3 = cliente("1750033344", "Diego", "López", "0973334455", "diego@gmail.com");
        Cliente c4 = cliente("1750044455", "María", "Torres", "0964445566", "maria@gmail.com");
        Cliente c5 = cliente("1750055566", "Kevin", "Castro", "0955556677", "kevin@gmail.com");
        clienteRepository.saveAll(List.of(c1, c2, c3, c4, c5));

        Membresia m1 = membresia("Mensual", "Acceso básico al gimnasio por 30 días", 30, "25.00");
        Membresia m2 = membresia("Trimestral", "Acceso completo por 3 meses", 90, "65.00");
        Membresia m3 = membresia("Semestral", "Acceso completo por 6 meses", 180, "120.00");
        Membresia m4 = membresia("Anual", "Acceso completo por 1 año", 365, "220.00");
        membresiaRepository.saveAll(List.of(m1, m2, m3, m4));

        Clase cl1 = clase("Musculación", "Clase de fuerza y pesas", "Lunes 08:00 - 09:00", "Área de Pesas A1", 20, e1);
        Clase cl2 = clase("Crossfit", "Entrenamiento funcional intenso", "Martes 18:00 - 19:00", "Box Funcional B2", 15, e2);
        Clase cl3 = clase("Cardio", "Ejercicios cardiovasculares", "Miércoles 17:00 - 18:00", "Sala Cardio C1", 25, e3);
        Clase cl4 = clase("Spinning", "Clase en bicicleta estática", "Jueves 19:00 - 20:00", "Sala Spinning S1", 18, e4);
        Clase cl5 = clase("Yoga", "Relajación y flexibilidad", "Viernes 07:00 - 08:00", "Aula Zen Y1", 12, e5);
        claseRepository.saveAll(List.of(cl1, cl2, cl3, cl4, cl5));

        Inscripcion i1 = inscripcion(c1, m1, 30);
        Inscripcion i2 = inscripcion(c2, m2, 90);
        Inscripcion i3 = inscripcion(c3, m4, 365);
        Inscripcion i4 = inscripcion(c4, m3, 180);
        Inscripcion i5 = inscripcion(c5, m1, 30);
        inscripcionRepository.saveAll(List.of(i1, i2, i3, i4, i5));

        pagoInscripcion(i1, "Efectivo", "25.00");
        pagoInscripcion(i2, "Transferencia", "65.00");
        pagoInscripcion(i3, "Tarjeta", "220.00");
        pagoInscripcion(i4, "Efectivo", "120.00");
        pagoInscripcion(i5, "Transferencia", "25.00");

        asistenciaRepository.saveAll(List.of(
                asistencia(c1, cl1), asistencia(c2, cl2), asistencia(c3, cl3), asistencia(c4, cl4), asistencia(c5, cl5)
        ));

        Producto p1 = producto("Proteína Whey", "Proteína en polvo 1kg", "45.00", 20);
        Producto p2 = producto("Shaker", "Botella deportiva para gimnasio", "8.50", 50);
        Producto p3 = producto("Gatorade", "Bebida hidratante personal", "1.50", 100);
        Producto p4 = producto("Toalla Gym", "Toalla deportiva", "6.00", 40);
        Producto p5 = producto("Guantes Gym", "Guantes para pesas", "12.00", 25);
        productoRepository.saveAll(List.of(p1, p2, p3, p4, p5));

        Venta v1 = venta(c1, "53.50");
        Venta v2 = venta(c2, "9.00");
        Venta v3 = venta(c3, "45.00");
        Venta v4 = venta(c4, "18.00");
        Venta v5 = venta(c5, "12.00");
        ventaRepository.saveAll(List.of(v1, v2, v3, v4, v5));

        detalleVentaRepository.saveAll(List.of(
                detalle(v1, p1, 1, "45.00"), detalle(v1, p2, 1, "8.50"),
                detalle(v2, p3, 6, "1.50"), detalle(v3, p1, 1, "45.00"),
                detalle(v4, p4, 3, "6.00"), detalle(v5, p5, 1, "12.00")
        ));
    }

    private Cliente cliente(String cedula, String nombre, String apellido, String telefono, String correo) {
        Cliente c = new Cliente();
        c.setCedula(cedula); c.setNombre(nombre); c.setApellido(apellido); c.setTelefono(telefono);
        c.setCorreo(correo); c.setFechaRegistro(LocalDate.now()); c.setEstado(true);
        return c;
    }

    private Entrenador entrenador(String cedula, String nombre, String apellido, String telefono, String especialidad) {
        Entrenador e = new Entrenador();
        e.setCedula(cedula); e.setNombre(nombre); e.setApellido(apellido); e.setTelefono(telefono); e.setEspecialidad(especialidad);
        return e;
    }

    private Membresia membresia(String nombre, String descripcion, Integer duracion, String precio) {
        Membresia m = new Membresia();
        m.setNombre(nombre); m.setDescripcion(descripcion); m.setDuracionDias(duracion); m.setPrecio(new BigDecimal(precio));
        return m;
    }

    private Clase clase(String nombre, String descripcion, String horario, String aula, Integer cupo, Entrenador entrenador) {
        Clase c = new Clase();
        c.setNombre(nombre); c.setDescripcion(descripcion); c.setHorario(horario); c.setAula(aula); c.setCupoMaximo(cupo); c.setEntrenador(entrenador);
        return c;
    }

    private Inscripcion inscripcion(Cliente cliente, Membresia membresia, int dias) {
        Inscripcion i = new Inscripcion();
        i.setCliente(cliente); i.setMembresia(membresia); i.setFechaInicio(LocalDate.now());
        i.setFechaFin(LocalDate.now().plusDays(dias)); i.setEstado("ACTIVA");
        return i;
    }

    private void pagoInscripcion(Inscripcion inscripcion, String metodo, String monto) {
        Pago p = new Pago();
        p.setInscripcion(inscripcion); p.setTipoPago("MEMBRESIA"); p.setMetodoPago(metodo);
        p.setMonto(new BigDecimal(monto)); p.setFechaPago(LocalDate.now()); p.setEstado("PAGADO");
        pagoRepository.save(p);
    }

    private Asistencia asistencia(Cliente cliente, Clase clase) {
        Asistencia a = new Asistencia();
        a.setCliente(cliente); a.setClase(clase); a.setFechaAsistencia(LocalDate.now());
        return a;
    }

    private Producto producto(String nombre, String descripcion, String precio, Integer stock) {
        Producto p = new Producto();
        p.setNombre(nombre); p.setDescripcion(descripcion); p.setPrecio(new BigDecimal(precio)); p.setStock(stock);
        return p;
    }

    private Venta venta(Cliente cliente, String total) {
        Venta v = new Venta();
        v.setCliente(cliente); v.setFechaVenta(LocalDate.now()); v.setTotal(new BigDecimal(total));
        return v;
    }

    private DetalleVenta detalle(Venta venta, Producto producto, Integer cantidad, String precioUnitario) {
        DetalleVenta d = new DetalleVenta();
        BigDecimal precio = new BigDecimal(precioUnitario);
        d.setVenta(venta); d.setProducto(producto); d.setCantidad(cantidad);
        d.setPrecioUnitario(precio); d.setSubtotal(precio.multiply(BigDecimal.valueOf(cantidad)));
        return d;
    }
}
