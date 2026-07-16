package com.petcare.petwellness.Service;

public interface OtpRateLimitService {

    boolean tryConsume(String email);
}
