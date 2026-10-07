package org.example.security.jaas;

import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;
import java.security.Principal;
import java.util.Map;


/**
 * Documentación JavaDoc de la clase GymLoginModule.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.security.jaas.GymLoginModule.java</p>
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
public class GymLoginModule implements LoginModule {
    private Subject subject;
    private CallbackHandler callbackHandler;
    private Principal principal;
    private boolean loginSucceeded;

    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler,
                           Map<String, ?> sharedState, Map<String, ?> options) {
        this.subject = subject;
        this.callbackHandler = callbackHandler;
    }

    @Override
    public boolean login() throws LoginException {
        try {
            JaasCredentialsCallback callback = new JaasCredentialsCallback();
            callbackHandler.handle(new Callback[]{callback});
            JaasCredentials credentials = callback.getCredentials();

            if (credentials == null || !JaasUserStore.authenticate(credentials.getUsername(), credentials.getPassword())) {
                throw new LoginException("Credenciales inválidas");
            }

            principal = () -> credentials.getUsername();
            loginSucceeded = true;
            return true;
        } catch (LoginException e) {
            throw e;
        } catch (Exception e) {
            LoginException loginException = new LoginException("Error en autenticación JAAS");
            loginException.initCause(e);
            throw loginException;
        }
    }

    @Override
    public boolean commit() {
        if (!loginSucceeded) return false;
        subject.getPrincipals().add(principal);
        return true;
    }

    @Override
    public boolean abort() {
        logout();
        return true;
    }

    @Override
    public boolean logout() {
        if (principal != null) {
            subject.getPrincipals().remove(principal);
        }
        principal = null;
        loginSucceeded = false;
        return true;
    }
}
