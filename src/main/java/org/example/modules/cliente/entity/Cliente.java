package org.example.modules.cliente.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/** Entidad que representa a un cliente del gimnasio. */
@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;
    private String cedula;
    private String nombre;
    private String apellido;
    private String telefono;
    private String correo;
    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;
    private Boolean estado;

    @Column(name = "auth_user_id")
    private Long authUserId;

    /** Se expone para edición/visualización, pero no se persiste en cliente. */
    @Transient
    private String username;

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }
    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
    public Long getAuthUserId() { return authUserId; }
    public void setAuthUserId(Long authUserId) { this.authUserId = authUserId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
