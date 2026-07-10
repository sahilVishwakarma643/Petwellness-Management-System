package com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.petcare.petwellness.Enums.OrderStatus;

public class OrderSummaryResponseDTO {

    private Long orderId;
    private String summary;
    private String image;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private OrderStatus status;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
