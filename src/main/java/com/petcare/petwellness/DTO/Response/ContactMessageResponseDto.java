package com.petcare.petwellness.DTO.Response;

import com.petcare.petwellness.Enums.ContactMessageStatus;

import java.time.LocalDateTime;

public class ContactMessageResponseDto {

    private Long id;
    private Long userId;
    private String senderName;
    private String senderEmail;
    private String phoneNumber;
    private String message;
    private String replyMessage;
    private ContactMessageStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private LocalDateTime repliedAt;

    public ContactMessageResponseDto() {
    }

    public ContactMessageResponseDto(
            Long id,
            Long userId,
            String senderName,
            String senderEmail,
            String phoneNumber,
            String message,
            String replyMessage,
            ContactMessageStatus status,
            LocalDateTime createdAt,
            LocalDateTime readAt,
            LocalDateTime repliedAt) {
        this.id = id;
        this.userId = userId;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.phoneNumber = phoneNumber;
        this.message = message;
        this.replyMessage = replyMessage;
        this.status = status;
        this.createdAt = createdAt;
        this.readAt = readAt;
        this.repliedAt = repliedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getMessage() {
        return message;
    }

    public String getReplyMessage() {
        return replyMessage;
    }

    public ContactMessageStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public LocalDateTime getRepliedAt() {
        return repliedAt;
    }
}
