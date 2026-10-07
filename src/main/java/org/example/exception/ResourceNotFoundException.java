package org.example.exception;

/**
 * Excepción usada cuando un registro solicitado no existe en la base de datos.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
