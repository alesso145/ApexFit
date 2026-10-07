package org.example.soap.mapper;

import org.example.modules.producto.entity.Producto;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import static org.example.soap.config.SoapEndpointPaths.PRODUCTOS_NAMESPACE;

/**
 * Mapper XML para convertir productos del sistema a nodos SOAP.
 */
public final class ProductoSoapMapper {

    private ProductoSoapMapper() {
        // Clase utilitaria.
    }

    /**
     * Convierte un producto de la base de datos a un elemento XML SOAP.
     *
     * @param document documento XML donde se creará el nodo.
     * @param producto producto a convertir.
     * @return elemento XML producto.
     */
    public static Element toProductoElement(Document document, Producto producto) {
        Element element = document.createElementNS(PRODUCTOS_NAMESPACE, "tns:producto");
        add(document, element, "idProducto", producto.getIdProducto());
        add(document, element, "nombre", producto.getNombre());
        add(document, element, "descripcion", producto.getDescripcion());
        add(document, element, "precio", producto.getPrecio());
        add(document, element, "stock", producto.getStock());
        return element;
    }

    /** Agrega un campo simple al XML de respuesta. */
    public static void add(Document document, Element parent, String name, Object value) {
        Element child = document.createElementNS(PRODUCTOS_NAMESPACE, "tns:" + name);
        child.setTextContent(value == null ? "" : String.valueOf(value));
        parent.appendChild(child);
    }
}
