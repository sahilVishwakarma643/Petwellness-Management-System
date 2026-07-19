package com.petcare.petwellness.DTO.Response;

public class AdminDashboardAppointmentTrendDto {

    private String week;
    private int appointments;

    public AdminDashboardAppointmentTrendDto(String week, int appointments) {
        this.week = week;
        this.appointments = appointments;
    }

    public String getWeek() {
        return week;
    }

    public int getAppointments() {
        return appointments;
    }
}
