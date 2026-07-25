package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.DTO.Request.ExternalReq.BrevoEmailRequestDto;
import com.petcare.petwellness.Exceptions.CustomException.ServiceUnavailableException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Service
@ConditionalOnProperty(
        name = "app.email.provider",
        havingValue = "brevo"
)
public class BrevoEmailServiceImp implements EmailService {

    private final RestClient restClient;
    private final String apiKey;
    private final String senderName;
    private final String senderEmail;

    public BrevoEmailServiceImp(
            RestClient.Builder builder,
            @Value("${brevo.api.key}") String apiKey,
            @Value("${brevo.sender.name}") String senderName,
            @Value("${brevo.sender.email}") String senderEmail
    ) {

        this.restClient = builder
                .baseUrl("https://api.brevo.com/v3")
                .build();

        this.apiKey = apiKey;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {

        BrevoEmailRequestDto request = new BrevoEmailRequestDto(
                new BrevoEmailRequestDto.Sender(
                        senderName,
                        senderEmail
                ),
                List.of(
                        new BrevoEmailRequestDto.Recipient(to)
                ),
                subject,
                body
        );

        try {

            restClient.post()
                    .uri("/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("api-key", apiKey)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException ex) {
    throw new ServiceUnavailableException(
            "Failed to send email.",
            ex
    );
}
    }
}