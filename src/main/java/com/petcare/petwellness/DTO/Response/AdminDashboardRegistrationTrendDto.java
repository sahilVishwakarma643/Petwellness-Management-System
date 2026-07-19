package com.petcare.petwellness.DTO.Response;

public class AdminDashboardRegistrationTrendDto {

    private String month;
    private int users;

    public AdminDashboardRegistrationTrendDto(String month, int users) {
        this.month = month;
        this.users = users;
    }

    public String getMonth() {
        return month;
    }

    public int getUsers() {
        return users;
    }
}
