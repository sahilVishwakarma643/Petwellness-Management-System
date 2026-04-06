package com.petcare.petwellness.DTO.Response;

public class ApprovedUserResponseDto {

    private Long id;
    private String fullName;
    private String email;

    public ApprovedUserResponseDto(Long id, String fullName, String email) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }
}
