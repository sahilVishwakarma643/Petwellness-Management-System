package com.petcare.petwellness.DTO.Response;

public class ContactActionResponseDto {

    private String message;

    public ContactActionResponseDto(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
