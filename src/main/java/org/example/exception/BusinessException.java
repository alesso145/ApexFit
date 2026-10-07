package org.example.exception;

/**
 * Excepción de negocio para validaciones controladas del sistema APEX FIT.
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
