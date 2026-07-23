package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.ContactMessageCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ContactMessageReplyRequestDto;
import com.petcare.petwellness.DTO.Response.ContactActionResponseDto;
import com.petcare.petwellness.DTO.Response.ContactMessageResponseDto;
import com.petcare.petwellness.DTO.Response.UnreadCountResponseDto;
import com.petcare.petwellness.Domain.Entity.ContactMessage;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.ContactMessageStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.ServiceUnavailableException;
import com.petcare.petwellness.Repository.ContactMessageRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.ContactMessageService;
import com.petcare.petwellness.Service.EmailService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactMessageServiceImp implements ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ContactMessageServiceImp(
            ContactMessageRepository contactMessageRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.contactMessageRepository = contactMessageRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public ContactActionResponseDto submitMessage(ContactMessageCreateRequestDto request, String authenticatedEmail) {
        ContactMessage message = new ContactMessage();
        message.setSenderName(request.getName().trim());
        message.setSenderEmail(request.getEmail().trim().toLowerCase());
        message.setPhoneNumber(request.getPhoneNumber().trim());
        message.setMessage(request.getMessage().trim());
        message.setStatus(ContactMessageStatus.UNREAD);

        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            userRepository.findByEmail(authenticatedEmail)
                    .ifPresent(message::setUser);
        }

        contactMessageRepository.save(message);
        return new ContactActionResponseDto("Your message sent successfully.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactMessageResponseDto> getAdminMessages(String status, int offset, int limit) {
        validatePagination(offset, limit);
        PageRequest pageRequest = PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<ContactMessage> messages;

        try {
            if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
                messages = contactMessageRepository.findAllByOrderByCreatedAtDesc(pageRequest).getContent();
            } else {
                ContactMessageStatus parsedStatus = ContactMessageStatus.valueOf(status.trim().toUpperCase());
                messages = contactMessageRepository.findByStatusOrderByCreatedAtDesc(parsedStatus, pageRequest).getContent();
            }
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid message status filter. Use ALL, UNREAD, READ, or REPLIED.");
        }

        return messages.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponseDto getUnreadCount() {
        return new UnreadCountResponseDto(contactMessageRepository.countUnreadMessages());
    }

    @Override
    @Transactional
    public ContactActionResponseDto markAsRead(Long messageId) {
        ContactMessage message = loadMessage(messageId);
        if (message.getStatus() == ContactMessageStatus.UNREAD) {
            message.setStatus(ContactMessageStatus.READ);
            message.setReadAt(LocalDateTime.now());
            contactMessageRepository.save(message);
        }
        return new ContactActionResponseDto("Message marked as read.");
    }

    @Override
    @Transactional
    public ContactActionResponseDto markAsInvalid(Long messageId) {
        ContactMessage message = loadMessage(messageId);
        if (message.getStatus() != ContactMessageStatus.INVALID) {
            message.setStatus(ContactMessageStatus.INVALID);
            if (message.getReadAt() == null) {
                message.setReadAt(LocalDateTime.now());
            }
            contactMessageRepository.save(message);
        }
        return new ContactActionResponseDto("Message marked as invalid.");
    }

    @Override
    @Transactional
    public ContactActionResponseDto deleteMessage(Long messageId) {
        ContactMessage message = loadMessage(messageId);
        contactMessageRepository.delete(message);
        return new ContactActionResponseDto("Message deleted successfully.");
    }

    @Override
    @Transactional
    public ContactActionResponseDto replyToMessage(Long messageId, ContactMessageReplyRequestDto request) {
        ContactMessage message = loadMessage(messageId);
        String replyMessage = request.getReplyMessage().trim();

        if (replyMessage.isBlank()) {
            throw new BadRequestException("Reply message is required");
        }

        String recipientEmail = message.getSenderEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            throw new BadRequestException("Sender email is missing for this contact message.");
        }
        if (!recipientEmail.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new BadRequestException("Cannot send reply because the stored email address is invalid.");
        }

        try {
            emailService.sendEmail(
                    recipientEmail,
                    "Reply from PetCare Support",
                    replyMessage
            );
        } catch (RuntimeException ex) {
            String raw = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
            if (raw.contains("invalid") || raw.contains("address")) {
                throw new BadRequestException("Reply could not be sent because the email address is invalid.");
            }
            throw new ServiceUnavailableException("Reply could not be sent because the email service is unavailable. Please try again later.");
        }

        message.setReplyMessage(replyMessage);
        message.setRepliedAt(LocalDateTime.now());
        message.setReadAt(message.getReadAt() == null ? LocalDateTime.now() : message.getReadAt());
        message.setStatus(ContactMessageStatus.REPLIED);
        contactMessageRepository.save(message);

        return new ContactActionResponseDto("Reply sent successfully.");
    }

    private ContactMessage loadMessage(Long messageId) {
        if (messageId == null) {
            throw new BadRequestException("Message id is required");
        }
        return contactMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found"));
    }

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }

    private ContactMessageResponseDto toDto(ContactMessage message) {
        User user = message.getUser();
        return new ContactMessageResponseDto(
                message.getId(),
                user == null ? null : user.getId(),
                message.getSenderName(),
                message.getSenderEmail(),
                message.getPhoneNumber(),
                message.getMessage(),
                message.getReplyMessage(),
                message.getStatus(),
                message.getCreatedAt(),
                message.getReadAt(),
                message.getRepliedAt()
        );
    }
}
