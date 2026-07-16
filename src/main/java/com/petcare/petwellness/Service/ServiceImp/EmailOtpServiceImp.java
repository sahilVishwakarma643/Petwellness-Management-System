package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.Config.OtpProperties;
import com.petcare.petwellness.DTO.Request.SendOtpRequestDto;
import com.petcare.petwellness.DTO.Request.VerifyOtpRequestDto;
import com.petcare.petwellness.DTO.Response.SendOtpResponseDto;
import com.petcare.petwellness.DTO.Response.VerifyOtpResponseDto;
import com.petcare.petwellness.Domain.Entity.EmailOtp;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.EmailOtpRepository;
import com.petcare.petwellness.Service.EmailOtpService;
import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.Service.OtpRateLimitService;
import com.petcare.petwellness.Util.OtpGeneratorUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailOtpServiceImp implements EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final OtpRateLimitService otpRateLimitService;
    private final OtpProperties otpProperties;

    public EmailOtpServiceImp(
            EmailOtpRepository emailOtpRepository,
            EmailService emailService,
            OtpRateLimitService otpRateLimitService,
            OtpProperties otpProperties) {

        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
        this.otpRateLimitService = otpRateLimitService;
        this.otpProperties = otpProperties;
    }

    @Override
    public SendOtpResponseDto sendOtp(SendOtpRequestDto request) {

        String email = normalizeEmail(request.getEmail());

        if (!otpRateLimitService.tryConsume(email)) {
            throw new BadRequestException(
                    "Too many OTP requests. Please wait before requesting another OTP."
            );
        }

        String generatedOtp = OtpGeneratorUtil.generateOtp();

        EmailOtp emailOtp = emailOtpRepository
                .findByEmail(email)
                .orElse(new EmailOtp());

        emailOtp.setEmail(email);
        emailOtp.setOtp(generatedOtp);

        emailOtp.setExpiryTime(
                LocalDateTime.now().plusMinutes(
                        otpProperties.getExpiryMinutes()
                )
        );

        emailOtp.setVerified(false);
        emailOtp.resetFailedAttempts();

        emailOtpRepository.save(emailOtp);

        emailService.sendEmail(
                email,
                "Pet Wellness OTP Verification",
                "Your OTP is: "
                        + generatedOtp
                        + "\nThis OTP is valid for "
                        + otpProperties.getExpiryMinutes()
                        + " minutes."
        );

        return new SendOtpResponseDto(
                "OTP sent successfully"
        );
    }

    @Override
    public VerifyOtpResponseDto verifyOtp(
            VerifyOtpRequestDto request) {

        String email = normalizeEmail(request.getEmail());

        validateOtp(email, request.getOtp());

        EmailOtp emailOtp = getOtpByEmail(email);

        emailOtp.setVerified(true);
        emailOtpRepository.save(emailOtp);

        return new VerifyOtpResponseDto(
                "OTP verified successfully",
                "COMPLETE_PROFILE"
        );
    }

    @Override
    public void validateOtp(String email, String otp) {

        String normalizedEmail = normalizeEmail(email);

        EmailOtp emailOtp =
                getOtpByEmail(normalizedEmail);

        if (emailOtp.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new BadRequestException(
                    "OTP has expired"
            );
        }

        if (emailOtp.isVerified()) {

            throw new BadRequestException(
                    "OTP already verified"
            );
        }

        if (emailOtp.getFailedAttempts()
                >= otpProperties.getMaxFailedAttempts()) {

            throw new BadRequestException(
                    "Too many failed OTP attempts. Request a new OTP."
            );
        }

        if (!emailOtp.getOtp().equals(otp)) {

            emailOtp.incrementFailedAttempts();
            emailOtpRepository.save(emailOtp);

            throw new BadRequestException(
                    "Invalid OTP"
            );
        }
    }

    private EmailOtp getOtpByEmail(String email) {

        return emailOtpRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "OTP not requested for this email"
                        )
                );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}