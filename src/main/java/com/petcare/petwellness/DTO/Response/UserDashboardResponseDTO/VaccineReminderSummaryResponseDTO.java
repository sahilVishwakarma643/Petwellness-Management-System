package com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO;

import java.time.LocalDate;

import com.petcare.petwellness.Enums.VaccinationStatus;

public class VaccineReminderSummaryResponseDTO {

    private String petName;
    private String vaccineName;
    private LocalDate nextDueDate;
    private VaccinationStatus status;

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public String getVaccineName() {
        return vaccineName;
    }

    public void setVaccineName(String vaccineName) {
        this.vaccineName = vaccineName;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public VaccinationStatus getStatus() {
        return status;
    }

    public void setStatus(VaccinationStatus status) {
        this.status = status;
    }
}
