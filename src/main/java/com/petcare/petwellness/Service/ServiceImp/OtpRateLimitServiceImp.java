package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.Config.OtpProperties;
import com.petcare.petwellness.Service.OtpRateLimitService;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpRateLimitServiceImp implements OtpRateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final OtpProperties otpProperties;

    public OtpRateLimitServiceImp(OtpProperties otpProperties) {
        this.otpProperties = otpProperties;
    }

    @Override
    public boolean tryConsume(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        Bucket bucket = buckets.computeIfAbsent(
                normalizedEmail,
                key -> createBucket()
        );

        return bucket.tryConsume(1);
    }

    private Bucket createBucket() {

        OtpProperties.Cooldown cooldown =
                otpProperties.getRateLimit().getCooldown();

        OtpProperties.Window window =
                otpProperties.getRateLimit().getWindow();

        return Bucket.builder()

                .addLimit(limit -> limit
                        .capacity(cooldown.getCapacity())
                        .refillIntervally(
                                cooldown.getRefillTokens(),
                                Duration.ofSeconds(
                                        cooldown.getDurationSeconds()
                                )
                        )
                )

                .addLimit(limit -> limit
                        .capacity(window.getCapacity())
                        .refillIntervally(
                                window.getRefillTokens(),
                                Duration.ofMinutes(
                                        window.getDurationMinutes()
                                )
                        )
                )

                .build();
    }
}