package com.petcare.petwellness.Exceptions.CustomException;

public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String message) {
        super(message);
    }
}
