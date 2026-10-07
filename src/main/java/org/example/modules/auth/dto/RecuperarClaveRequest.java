package org.example.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Solicitud pública para recuperar la clave verificando usuario y cédula. */
public class RecuperarClaveRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String cedula;

    @NotBlank
    @Size(min = 6, max = 100)
    private String nuevaClave;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }
    public String getNuevaClave() { return nuevaClave; }
    public void setNuevaClave(String nuevaClave) { this.nuevaClave = nuevaClave; }
}
