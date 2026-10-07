package org.example.modules.venta.dto;

import java.util.ArrayList;
import java.util.List;

/** Solicitud atómica para completar una compra desde el punto de venta. */
public class VentaPOSDTO {
    private Integer clienteId;
    private String metodoPago;
    private List<ItemDTO> items = new ArrayList<>();

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public List<ItemDTO> getItems() { return items; }
    public void setItems(List<ItemDTO> items) { this.items = items; }

    public static class ItemDTO {
        private Integer productoId;
        private Integer cantidad;

        public Integer getProductoId() { return productoId; }
        public void setProductoId(Integer productoId) { this.productoId = productoId; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}
