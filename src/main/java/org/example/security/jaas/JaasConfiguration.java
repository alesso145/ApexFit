package org.example.security.jaas;

import org.springframework.context.annotation.Configuration;

import javax.security.auth.login.AppConfigurationEntry;


/**
 * Documentación JavaDoc de la clase JaasConfiguration.
 *
 * <p>Forma parte del sistema APEX FIT y describe la responsabilidad
 * principal del componente dentro de la arquitectura Spring Boot del proyecto.
 * Esta documentación permite generar la interfaz HTML de JavaDoc para revisión
 * académica y mantenimiento del código.</p>
 *
 * <p>Paquete/archivo: org.example.security.jaas.JaasConfiguration.java</p>
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
@Configuration
public class JaasConfiguration extends javax.security.auth.login.Configuration {

    public static final String CONFIG_NAME = "GymCRUD-JAAS";

    @Override
    public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
        if (!CONFIG_NAME.equals(name)) return null;
        return new AppConfigurationEntry[]{
                new AppConfigurationEntry(
                        GymLoginModule.class.getName(),
                        AppConfigurationEntry.LoginModuleControlFlag.REQUIRED,
                        java.util.Map.of()
                )
        };
    }
}
