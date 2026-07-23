package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContactMessageReplyRequestDto {

    @NotBlank(message = "Reply message is required")
    @Size(max = 4000, message = "Reply message is too long")
    private String replyMessage;

    public String getReplyMessage() {
        return replyMessage;
    }

    public void setReplyMessage(String replyMessage) {
        this.replyMessage = replyMessage;
    }
}
