package org.example.security.jaas;

import org.springframework.stereotype.Service;

import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
/**
 * Componente de seguridad JAAS encargado de validar credenciales usadas por servicios protegidos.
 *
 * <p>Esta documentación forma parte del JavaDoc Maven del proyecto y permite
 * explicar la responsabilidad de la clase durante la revisión técnica.</p>
 *
 * @author Javier Paredes
 * @version 1.0
 */

@Service
public class JaasAuthenticationService {

    private final JaasConfiguration jaasConfiguration;

    public JaasAuthenticationService(JaasConfiguration jaasConfiguration) {
        this.jaasConfiguration = jaasConfiguration;
    }

    /**
     * Autentica usuario y contraseña mediante JAAS.
     */
    public void authenticate(String username, String password) throws LoginException {
        LoginContext loginContext = new LoginContext(
                JaasConfiguration.CONFIG_NAME,
                null,
                new JaasAuthCallbackHandler(username, password),
                jaasConfiguration
        );
        loginContext.login();
    }

    /**
     * Autentica mediante JAAS y valida que el usuario tenga un rol autorizado.
     * Esto permite demostrar seguridad aplicada directamente al SOAP.
     */
    public void authenticateWithRole(String username, String password, String... allowedRoles) throws LoginException {
        authenticate(username, password);
        if (!JaasUserStore.authenticateWithRole(username, password, allowedRoles)) {
            throw new LoginException("El usuario no tiene permisos para consumir el SOAP");
        }
    }
}
