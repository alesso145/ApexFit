package org.example.soap.config;

/**
 * Centraliza los nombres usados por el servicio SOAP del módulo de productos.
 *
 * <p>El SOAP simula la integración con una empresa/proveedor externo que envía
 * ingresos grandes de stock hacia el inventario del gimnasio.</p>
 */
public final class SoapEndpointPaths {

    /** Namespace público del WSDL de productos. */
    public static final String PRODUCTOS_NAMESPACE = "http://example.org/gym/productos";

    private SoapEndpointPaths() {
        // Clase utilitaria: no debe instanciarse.
    }
}
