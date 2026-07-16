package com.petcare.petwellness.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "otp")
public class OtpProperties {

    private long expiryMinutes;
    private int maxFailedAttempts;
    private RateLimit rateLimit = new RateLimit();

    public long getExpiryMinutes() {
        return expiryMinutes;
    }

    public void setExpiryMinutes(long expiryMinutes) {
        this.expiryMinutes = expiryMinutes;
    }

    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }

    public void setMaxFailedAttempts(int maxFailedAttempts) {
        this.maxFailedAttempts = maxFailedAttempts;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(RateLimit rateLimit) {
        this.rateLimit = rateLimit;
    }

    public static class RateLimit {

        private Cooldown cooldown = new Cooldown();
        private Window window = new Window();

        public Cooldown getCooldown() {
            return cooldown;
        }

        public void setCooldown(Cooldown cooldown) {
            this.cooldown = cooldown;
        }

        public Window getWindow() {
            return window;
        }

        public void setWindow(Window window) {
            this.window = window;
        }
    }

    public static class Cooldown {

        private long capacity;
        private long refillTokens;
        private long durationSeconds;

        public long getCapacity() {
            return capacity;
        }

        public void setCapacity(long capacity) {
            this.capacity = capacity;
        }

        public long getRefillTokens() {
            return refillTokens;
        }

        public void setRefillTokens(long refillTokens) {
            this.refillTokens = refillTokens;
        }

        public long getDurationSeconds() {
            return durationSeconds;
        }

        public void setDurationSeconds(long durationSeconds) {
            this.durationSeconds = durationSeconds;
        }
    }

    public static class Window {

        private long capacity;
        private long refillTokens;
        private long durationMinutes;

        public long getCapacity() {
            return capacity;
        }

        public void setCapacity(long capacity) {
            this.capacity = capacity;
        }

        public long getRefillTokens() {
            return refillTokens;
        }

        public void setRefillTokens(long refillTokens) {
            this.refillTokens = refillTokens;
        }

        public long getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(long durationMinutes) {
            this.durationMinutes = durationMinutes;
        }
    }
}