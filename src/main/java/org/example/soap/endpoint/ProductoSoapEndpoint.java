package org.example.soap.endpoint;

import org.example.modules.producto.entity.Producto;
import org.example.modules.producto.service.ProductoService;
import org.example.soap.mapper.ProductoSoapMapper;
import org.example.security.jaas.JaasAuthenticationService;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.math.BigDecimal;

import static org.example.soap.config.SoapEndpointPaths.PRODUCTOS_NAMESPACE;

/**
 * Endpoint SOAP para integración externa de productos.
 *
 * <p>Este servicio representa a una empresa/proveedor que puede consultar productos
 * y enviar grandes ingresos de stock hacia el inventario del gimnasio.</p>
 */
@Endpoint
public class ProductoSoapEndpoint {

    private final ProductoService productoService;
    private final JaasAuthenticationService jaasAuthenticationService;

    public ProductoSoapEndpoint(ProductoService productoService,
                                JaasAuthenticationService jaasAuthenticationService) {
        this.productoService = productoService;
        this.jaasAuthenticationService = jaasAuthenticationService;
    }

    /** Lista productos disponibles mediante SOAP. */
    @PayloadRoot(namespace = PRODUCTOS_NAMESPACE, localPart = "listarProductosRequest")
    @ResponsePayload
    public Element listarProductos(@RequestPayload Element request) throws Exception {
        validarSeguridadSoap(request);
        Document document = newDocument();
        Element response = document.createElementNS(PRODUCTOS_NAMESPACE, "tns:listarProductosResponse");
        for (Producto producto : productoService.listar()) {
            response.appendChild(ProductoSoapMapper.toProductoElement(document, producto));
        }
        return response;
    }

    /** Busca un producto por id mediante SOAP. */
    @PayloadRoot(namespace = PRODUCTOS_NAMESPACE, localPart = "buscarProductoRequest")
    @ResponsePayload
    public Element buscarProducto(@RequestPayload Element request) throws Exception {
        validarSeguridadSoap(request);
        Document document = newDocument();
        Element response = document.createElementNS(PRODUCTOS_NAMESPACE, "tns:buscarProductoResponse");

        Integer idProducto = getInteger(request, "idProducto");
        if (idProducto != null) {
            Producto producto = productoService.buscarPorId(idProducto);
            if (producto != null) response.appendChild(ProductoSoapMapper.toProductoElement(document, producto));
        }
        return response;
    }

    /**
     * Registra una entrada grande de stock enviada por un proveedor externo.
     *
     * <p>Ejemplo real: una empresa proveedora entrega 200 unidades de proteína,
     * el SOAP recibe la cantidad y la suma al stock actual del producto.</p>
     */
    @PayloadRoot(namespace = PRODUCTOS_NAMESPACE, localPart = "registrarIngresoStockRequest")
    @ResponsePayload
    public Element registrarIngresoStock(@RequestPayload Element request) throws Exception {
        validarSeguridadSoap(request);
        Integer idProducto = getInteger(request, "idProducto");
        String nombre = getText(request, "nombre");
        String descripcion = getText(request, "descripcion");
        BigDecimal precioUnitario = getDecimal(request, "precioUnitario");
        Integer cantidad = getInteger(request, "cantidad");
        String proveedor = getText(request, "proveedor");

        Producto producto = productoService.registrarIngresoStock(idProducto, nombre, descripcion, precioUnitario, cantidad);

        Document document = newDocument();
        Element response = document.createElementNS(PRODUCTOS_NAMESPACE, "tns:registrarIngresoStockResponse");
        ProductoSoapMapper.add(document, response, "exito", true);
        ProductoSoapMapper.add(document, response, "mensaje", "Stock recibido desde proveedor: " + (proveedor == null || proveedor.isBlank() ? "Proveedor externo" : proveedor));
        response.appendChild(ProductoSoapMapper.toProductoElement(document, producto));
        return response;
    }

    /**
     * Seguridad SOAP con JAAS.
     * El XML debe enviar usuario y password dentro del cuerpo SOAP.
     * Roles permitidos: PROVEEDOR, ADMIN y ENTRENADOR.
     */
    private void validarSeguridadSoap(Element request) throws Exception {
        String usuario = getText(request, "usuario");
        String password = getText(request, "password");
        jaasAuthenticationService.authenticateWithRole(usuario, password, "PROVEEDOR", "ADMIN", "ENTRENADOR");
    }

    private Document newDocument() throws Exception {
        return DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
    }

    private String getText(Element request, String name) {
        NodeList nodes = request.getElementsByTagNameNS(PRODUCTOS_NAMESPACE, name);
        if (nodes.getLength() == 0) return null;
        String value = nodes.item(0).getTextContent();
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Integer getInteger(Element request, String name) {
        String value = getText(request, name);
        return value == null ? null : Integer.parseInt(value);
    }

    private BigDecimal getDecimal(Element request, String name) {
        String value = getText(request, name);
        return value == null ? null : new BigDecimal(value);
    }
}
