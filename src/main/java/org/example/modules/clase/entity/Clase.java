package org.example.modules.clase.entity;

import org.example.modules.entrenador.entity.Entrenador;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
/**
 * Entidad JPA que representa datos persistentes del módulo clase.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */

@Entity
@Table(name = "clase")
public class Clase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_clase")
    private Integer idClase;

    @ManyToOne
    @JoinColumn(name = "id_entrenador")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Entrenador entrenador;

    private String nombre;
    private String descripcion;
    private String horario;

    /** Área, sala o aula física donde se dicta la clase. */
    private String aula;

    @Column(name = "cupo_maximo")
    private Integer cupoMaximo;

    public Integer getIdClase() { return idClase; }
    public void setIdClase(Integer idClase) { this.idClase = idClase; }
    public Entrenador getEntrenador() { return entrenador; }
    public void setEntrenador(Entrenador entrenador) { this.entrenador = entrenador; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public String getAula() { return aula; }
    public void setAula(String aula) { this.aula = aula; }
    public Integer getCupoMaximo() { return cupoMaximo; }
    public void setCupoMaximo(Integer cupoMaximo) { this.cupoMaximo = cupoMaximo; }
}
