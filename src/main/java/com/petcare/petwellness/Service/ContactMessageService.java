package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.ContactMessageCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ContactMessageReplyRequestDto;
import com.petcare.petwellness.DTO.Response.ContactActionResponseDto;
import com.petcare.petwellness.DTO.Response.ContactMessageResponseDto;
import com.petcare.petwellness.DTO.Response.UnreadCountResponseDto;

import java.util.List;

public interface ContactMessageService {

    ContactActionResponseDto submitMessage(ContactMessageCreateRequestDto request, String authenticatedEmail);

    List<ContactMessageResponseDto> getAdminMessages(String status, int offset, int limit);

    UnreadCountResponseDto getUnreadCount();

    ContactActionResponseDto markAsRead(Long messageId);

    ContactActionResponseDto markAsInvalid(Long messageId);

    ContactActionResponseDto deleteMessage(Long messageId);

    ContactActionResponseDto replyToMessage(Long messageId, ContactMessageReplyRequestDto request);
}
