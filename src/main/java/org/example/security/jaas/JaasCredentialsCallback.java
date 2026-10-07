package org.example.security.jaas;

import javax.security.auth.callback.Callback;


/**
 * Documentación JavaDoc de la clase JaasCredentialsCallback.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.security.jaas.JaasCredentialsCallback.java</p>
 *
 * @author Javier Eduardo Paredes Cabrera
 * @version 1.0
 */
/**
 * Componente de seguridad JAAS encargado de validar credenciales usadas por servicios protegidos.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */
public class JaasCredentialsCallback implements Callback {
    private JaasCredentials credentials;

    public JaasCredentials getCredentials() {
        return credentials;
    }

    public void setCredentials(JaasCredentials credentials) {
        this.credentials = credentials;
    }
}
