package com.petcare.petwellness.DTO.Response;

import java.time.LocalDateTime;
import java.util.List;

public class AdminDashboardOverviewResponseDto {

    private long totalRegisteredUsers;
    private long pendingApprovalRequests;
    private long appointmentsBooked;
    private long marketplaceListings;
    private int year;
    private LocalDateTime generatedAt;
    private LocalDateTime dataLastChangedAt;
    private List<AdminDashboardRegistrationTrendDto> registrationTrend;
    private List<AdminDashboardAppointmentTrendDto> weeklyAppointments;
    private List<AdminDashboardActivityDto> recentActivities;

    public AdminDashboardOverviewResponseDto(
            long totalRegisteredUsers,
            long pendingApprovalRequests,
            long appointmentsBooked,
            long marketplaceListings,
            int year,
            LocalDateTime generatedAt,
            LocalDateTime dataLastChangedAt,
            List<AdminDashboardRegistrationTrendDto> registrationTrend,
            List<AdminDashboardAppointmentTrendDto> weeklyAppointments,
            List<AdminDashboardActivityDto> recentActivities) {
        this.totalRegisteredUsers = totalRegisteredUsers;
        this.pendingApprovalRequests = pendingApprovalRequests;
        this.appointmentsBooked = appointmentsBooked;
        this.marketplaceListings = marketplaceListings;
        this.year = year;
        this.generatedAt = generatedAt;
        this.dataLastChangedAt = dataLastChangedAt;
        this.registrationTrend = registrationTrend;
        this.weeklyAppointments = weeklyAppointments;
        this.recentActivities = recentActivities;
    }

    public long getTotalRegisteredUsers() {
        return totalRegisteredUsers;
    }

    public long getPendingApprovalRequests() {
        return pendingApprovalRequests;
    }

    public long getAppointmentsBooked() {
        return appointmentsBooked;
    }

    public long getMarketplaceListings() {
        return marketplaceListings;
    }

    public int getYear() {
        return year;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public LocalDateTime getDataLastChangedAt() {
        return dataLastChangedAt;
    }

    public List<AdminDashboardRegistrationTrendDto> getRegistrationTrend() {
        return registrationTrend;
    }

    public List<AdminDashboardAppointmentTrendDto> getWeeklyAppointments() {
        return weeklyAppointments;
    }

    public List<AdminDashboardActivityDto> getRecentActivities() {
        return recentActivities;
    }
}
