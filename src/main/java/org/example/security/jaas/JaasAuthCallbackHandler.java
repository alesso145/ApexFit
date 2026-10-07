package org.example.security.jaas;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import java.io.IOException;


/**
 * Documentación JavaDoc de la clase JaasAuthCallbackHandler.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.security.jaas.JaasAuthCallbackHandler.java</p>
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
public class JaasAuthCallbackHandler implements CallbackHandler {
    private final JaasCredentials credentials;

    public JaasAuthCallbackHandler(String username, String password) {
        this.credentials = new JaasCredentials(username, password);
    }

    @Override
    public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
        for (Callback callback : callbacks) {
            if (callback instanceof JaasCredentialsCallback credentialsCallback) {
                credentialsCallback.setCredentials(credentials);
            } else {
                throw new UnsupportedCallbackException(callback);
            }
        }
    }
}
