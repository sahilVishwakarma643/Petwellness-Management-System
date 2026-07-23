package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.ContactMessageCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ContactMessageReplyRequestDto;
import com.petcare.petwellness.DTO.Response.ContactActionResponseDto;
import com.petcare.petwellness.DTO.Response.ContactMessageResponseDto;
import com.petcare.petwellness.DTO.Response.UnreadCountResponseDto;
import com.petcare.petwellness.Service.ContactMessageService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping("/contact-messages")
    public ResponseEntity<ContactActionResponseDto> submitMessage(
            @Valid @RequestBody ContactMessageCreateRequestDto request,
            Authentication authentication) {
        String authenticatedEmail =
                authentication != null && authentication.isAuthenticated() && !"anonymousUser".equalsIgnoreCase(authentication.getName())
                        ? authentication.getName()
                        : null;
        return ResponseEntity.ok(contactMessageService.submitMessage(request, authenticatedEmail));
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/contact-messages")
    public ResponseEntity<List<ContactMessageResponseDto>> getAdminMessages(
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(contactMessageService.getAdminMessages(status, offset, limit));
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/admin/contact-messages/unread-count")
    public ResponseEntity<UnreadCountResponseDto> getUnreadCount() {
        return ResponseEntity.ok(contactMessageService.getUnreadCount());
    }

    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/admin/contact-messages/{messageId}/read")
    public ResponseEntity<ContactActionResponseDto> markAsRead(@PathVariable Long messageId) {
        return ResponseEntity.ok(contactMessageService.markAsRead(messageId));
    }

    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/admin/contact-messages/{messageId}/invalid")
    public ResponseEntity<ContactActionResponseDto> markAsInvalid(@PathVariable Long messageId) {
        return ResponseEntity.ok(contactMessageService.markAsInvalid(messageId));
    }

    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/admin/contact-messages/{messageId}/reply")
    public ResponseEntity<ContactActionResponseDto> replyToMessage(
            @PathVariable Long messageId,
            @Valid @RequestBody ContactMessageReplyRequestDto request) {
        return ResponseEntity.ok(contactMessageService.replyToMessage(messageId, request));
    }

    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/admin/contact-messages/{messageId}")
    public ResponseEntity<ContactActionResponseDto> deleteMessage(@PathVariable Long messageId) {
        return ResponseEntity.ok(contactMessageService.deleteMessage(messageId));
    }
}
