package org.example.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Solicitud para cambiar la clave del usuario autenticado. */
public class CambiarClaveRequest {
    @NotBlank
    private String claveActual;

    @NotBlank
    @Size(min = 6, max = 100)
    private String nuevaClave;

    public String getClaveActual() { return claveActual; }
    public void setClaveActual(String claveActual) { this.claveActual = claveActual; }
    public String getNuevaClave() { return nuevaClave; }
    public void setNuevaClave(String nuevaClave) { this.nuevaClave = nuevaClave; }
}
