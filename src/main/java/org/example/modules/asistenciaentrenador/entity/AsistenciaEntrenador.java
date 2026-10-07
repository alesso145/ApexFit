package org.example.modules.asistenciaentrenador.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.example.modules.clase.entity.Clase;
import org.example.modules.entrenador.entity.Entrenador;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entidad JPA que representa la asistencia laboral de un entrenador.
 *
 * <p>Permite registrar qué entrenador dictó una clase, la fecha, hora de entrada,
 * hora de salida y el tiempo total trabajado. Este módulo es independiente de la
 * asistencia de clientes para separar correctamente los datos de profesores y clientes.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
@Entity
@Table(name = "asistencia_entrenador")
public class AsistenciaEntrenador {

    /** Identificador único de la asistencia del entrenador. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer idAsistenciaEntrenador;

    /** Entrenador que registra o tiene asignada la asistencia. */
    @ManyToOne
    @JoinColumn(name = "entrenador_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Entrenador entrenador;

    /** Clase dictada por el entrenador. */
    @ManyToOne
    @JoinColumn(name = "clase_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Clase clase;

    /** Fecha del registro de asistencia. */
    @Column(name = "fecha")
    private LocalDate fechaAsistencia;

    /** Indica si el entrenador asistió a la clase. */
    @Column(name = "presente")
    private Boolean presente = true;

    /** Hora en la que inicia la actividad del entrenador. */
    @Column(name = "hora_entrada")
    private LocalTime horaEntrada;

    /** Hora en la que termina la actividad del entrenador. */
    @Column(name = "hora_salida")
    private LocalTime horaSalida;

    /** Tiempo trabajado en minutos, calculado desde entrada y salida. */
    @Column(name = "tiempo_minutos")
    private Long tiempoMinutos;

    public Integer getIdAsistenciaEntrenador() { return idAsistenciaEntrenador; }
    public void setIdAsistenciaEntrenador(Integer idAsistenciaEntrenador) { this.idAsistenciaEntrenador = idAsistenciaEntrenador; }
    public Entrenador getEntrenador() { return entrenador; }
    public void setEntrenador(Entrenador entrenador) { this.entrenador = entrenador; }
    public Clase getClase() { return clase; }
    public void setClase(Clase clase) { this.clase = clase; }
    public LocalDate getFechaAsistencia() { return fechaAsistencia; }
    public void setFechaAsistencia(LocalDate fechaAsistencia) { this.fechaAsistencia = fechaAsistencia; }
    public Boolean getPresente() { return presente; }
    public void setPresente(Boolean presente) { this.presente = presente; }
    public LocalTime getHoraEntrada() { return horaEntrada; }
    public void setHoraEntrada(LocalTime horaEntrada) { this.horaEntrada = horaEntrada; }
    public LocalTime getHoraSalida() { return horaSalida; }
    public void setHoraSalida(LocalTime horaSalida) { this.horaSalida = horaSalida; }
    public Long getTiempoMinutos() { return tiempoMinutos; }
    public void setTiempoMinutos(Long tiempoMinutos) { this.tiempoMinutos = tiempoMinutos; }

    /** Calcula automáticamente el tiempo trabajado si existen hora de entrada y salida. */
    @PrePersist
    @PreUpdate
    public void calcularTiempo() {
        if (horaEntrada != null && horaSalida != null) {
            this.tiempoMinutos = Duration.between(horaEntrada, horaSalida).toMinutes();
        }
    }
}
