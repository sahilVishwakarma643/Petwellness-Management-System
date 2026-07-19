package com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO;

import java.util.ArrayList;
import java.util.List;

public class UserDashboardResponseDTO {

    private String ownerFullName;
    private Long petCount = 0L;
    private Long activeOrderCount = 0L;
    private List<AppointmentSummaryResponseDTO> appointments = new ArrayList<>();
    private List<OrderSummaryResponseDTO> orders = new ArrayList<>();
    private List<ProductSummaryResponseDTO> products = new ArrayList<>();
    private List<VaccineReminderSummaryResponseDTO> vaccineReminders = new ArrayList<>();

    public String getOwnerFullName() {
        return ownerFullName;
    }

    public void setOwnerFullName(String ownerFullName) {
        this.ownerFullName = ownerFullName;
    }

    public Long getPetCount() {
        return petCount;
    }

    public void setPetCount(Long petCount) {
        this.petCount = petCount;
    }

    public Long getActiveOrderCount() {
        return activeOrderCount;
    }

    public void setActiveOrderCount(Long activeOrderCount) {
        this.activeOrderCount = activeOrderCount;
    }

    public List<AppointmentSummaryResponseDTO> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<AppointmentSummaryResponseDTO> appointments) {
        this.appointments = appointments;
    }

    public List<OrderSummaryResponseDTO> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderSummaryResponseDTO> orders) {
        this.orders = orders;
    }

    public List<ProductSummaryResponseDTO> getProducts() {
        return products;
    }

    public void setProducts(List<ProductSummaryResponseDTO> products) {
        this.products = products;
    }

    public List<VaccineReminderSummaryResponseDTO> getVaccineReminders() {
        return vaccineReminders;
    }

    public void setVaccineReminders(List<VaccineReminderSummaryResponseDTO> vaccineReminders) {
        this.vaccineReminders = vaccineReminders;
    }
}
