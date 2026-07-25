package com.petcare.petwellness.DTO.Request.ExternalReq;

import java.util.List;

public record BrevoEmailRequestDto(

        Sender sender,

        List<Recipient> to,

        String subject,

        String textContent

) {

    public record Sender(
            String name,
            String email
    ) {
    }

    public record Recipient(
            String email
    ) {
    }
}