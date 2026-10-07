package org.example.modules.pago.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** DTO para registrar manualmente un cobro de membresía. */
public class PagoDTO {
    private Integer inscripcionId;
    private BigDecimal monto;
    private LocalDate fechaPago;
    private String metodoPago;
    private String estado;

    public Integer getInscripcionId() { return inscripcionId; }
    public void setInscripcionId(Integer inscripcionId) { this.inscripcionId = inscripcionId; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public LocalDate getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
