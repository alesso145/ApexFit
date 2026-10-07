package org.example.modules.asistencia.entity;

import org.example.modules.clase.entity.Clase;
import org.example.modules.cliente.entity.Cliente;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;


/**
 * Documentación JavaDoc de la clase Asistencia.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.modules.asistencia.entity.Asistencia.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Entidad JPA que representa datos persistentes del módulo asistencia.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Entity
@Table(name = "asistencia")
public class Asistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Integer idAsistencia;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_clase")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Clase clase;

    @Column(name = "fecha_asistencia")
    private LocalDate fechaAsistencia;

    public Integer getIdAsistencia() { return idAsistencia; }
    public void setIdAsistencia(Integer idAsistencia) { this.idAsistencia = idAsistencia; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Clase getClase() { return clase; }
    public void setClase(Clase clase) { this.clase = clase; }
    public LocalDate getFechaAsistencia() { return fechaAsistencia; }
    public void setFechaAsistencia(LocalDate fechaAsistencia) { this.fechaAsistencia = fechaAsistencia; }
}
