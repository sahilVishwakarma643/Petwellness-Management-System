package com.petcare.petwellness.DTO.Response;

public class UnreadCountResponseDto {

    private long unreadCount;

    public UnreadCountResponseDto(long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public long getUnreadCount() {
        return unreadCount;
    }
}
