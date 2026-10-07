package org.example.modules.cliente.dto;

/**
 * DTO para crear o actualizar un cliente junto con sus credenciales de acceso.
 * La contraseña se recibe en texto plano únicamente en la petición HTTPS y
 * nunca se devuelve al frontend.
 */
public class ClienteCuentaDTO {
    private String cedula;
    private String nombre;
    private String apellido;
    private String telefono;
    private String correo;
    private Boolean estado;
    private String username;
    private String password;

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
    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
