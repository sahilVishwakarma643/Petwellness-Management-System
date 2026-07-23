package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Response.AdminDashboardActivityDto;
import com.petcare.petwellness.DTO.Response.AdminDashboardAppointmentTrendDto;
import com.petcare.petwellness.DTO.Response.AdminDashboardOverviewResponseDto;
import com.petcare.petwellness.DTO.Response.AdminDashboardRegistrationTrendDto;
import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.AdminUserProfileResponseDto;
import com.petcare.petwellness.DTO.Response.ApprovedUserResponseDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import com.petcare.petwellness.Domain.Entity.Address;
import com.petcare.petwellness.Domain.Entity.Appointment;
import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.AppointmentStatus;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.PersonalInfoRepository;
import com.petcare.petwellness.Repository.AddressRepository;
import com.petcare.petwellness.Repository.AppointmentRepository;
import com.petcare.petwellness.Repository.ProductRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.AdminService;
import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.IntStream;


@Service
public class AdminServiceImp implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PersonalInfoRepository personalInfoRepository;
    private final AddressRepository addressRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProductRepository productRepository;
    private final FileStorageUtil fileStorageUtil;


    public AdminServiceImp(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            PersonalInfoRepository personalInfoRepository, AddressRepository addressRepository,
            AppointmentRepository appointmentRepository, ProductRepository productRepository,
            FileStorageUtil fileStorageUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
        this.appointmentRepository = appointmentRepository;
        this.productRepository = productRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    

    
    @Override
    public Page<PendingUserResponseDto> getPendingUsers(int offset, int limit) {
        validatePagination(offset, limit);

        return userRepository
                .findByProfileCompletedTrueAndStatus(UserStatus.PENDING,
                        PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(user -> new PendingUserResponseDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getCreatedAt()
                ));
    }

    @Override
    public Page<ApprovedUserResponseDto> getApprovedUsers(int offset, int limit) {
        validatePagination(offset, limit);

        return userRepository
                .findByRoleAndStatus(UserRole.OWNER, UserStatus.APPROVED,
                        PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(user -> new ApprovedUserResponseDto(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getCreatedAt()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardOverviewResponseDto getDashboardOverview(Integer year) {
        int targetYear = year == null ? LocalDate.now().getYear() : year;
        validateDashboardYear(targetYear);

        LocalDateTime yearStart = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime yearEnd = yearStart.plusYears(1);
        LocalDateTime trendCutoffStart = LocalDate.now().minusWeeks(5).with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime trendCutoffEnd = LocalDate.now().plusWeeks(1).with(java.time.DayOfWeek.SUNDAY).atTime(23, 59, 59);

        long pendingApprovalRequests = userRepository.countByProfileCompletedTrueAndStatus(UserStatus.PENDING);
        long approvedUsers = userRepository.countByRoleAndStatus(UserRole.OWNER, UserStatus.APPROVED);
        long totalRegisteredUsers = pendingApprovalRequests + approvedUsers;
        long appointmentsBooked = appointmentRepository.countByStatus(AppointmentStatus.BOOKED);
        long marketplaceListings = productRepository.count();

        List<User> yearlyUsers = userRepository.findByCreatedAtBetween(yearStart, yearEnd);
        List<Appointment> weeklyAppointments = appointmentRepository.findByStatusAndAppointmentDateBetween(
                AppointmentStatus.BOOKED,
                trendCutoffStart.toLocalDate(),
                trendCutoffEnd.toLocalDate());
        List<User> recentUsers = userRepository.findTop8ByOrderByCreatedAtDesc();
        List<Appointment> recentAppointments = appointmentRepository.findTop8ByStatusOrderByCreatedAtDesc(AppointmentStatus.BOOKED);
        List<Product> recentProducts = productRepository.findTop8ByOrderByCreatedAtDesc();

        LocalDateTime dataLastChangedAt = latestTimestamp(recentUsers, recentAppointments, recentProducts);

        return new AdminDashboardOverviewResponseDto(
                totalRegisteredUsers,
                pendingApprovalRequests,
                appointmentsBooked,
                marketplaceListings,
                targetYear,
                LocalDateTime.now(),
                dataLastChangedAt,
                buildYearlyRegistrationTrend(yearlyUsers, targetYear),
                buildWeeklyAppointmentTrend(weeklyAppointments),
                buildRecentActivities(recentUsers, recentAppointments, recentProducts)
        );
    }

    @Override
    public AdminUserProfileResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PersonalInfo personalInfo = personalInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Personal info not found for user"));

        Address address = addressRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for user"));

        return new AdminUserProfileResponseDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getFirstName(),
                personalInfo.getPhoneNumber(),
                personalInfo.getGender(),
                personalInfo.getHighestQualification(),
                personalInfo.getOccupation(),
                personalInfo.getFatherName(),
                personalInfo.getMotherName(),
                personalInfo.getDateOfBirth(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                user.getProfileImagePath(),
                user.getIdProofType(),
                user.getIdProofPath(),
                user.getCreatedAt()
        );
    }

    
   @Override
public String approveUser(Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getStatus() == UserStatus.APPROVED) {
        throw new RuntimeException("User already approved");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("Rejected user cannot be approved directly");
    }

    
    String tempPassword = "Temp" + System.currentTimeMillis() % 10000;


   
    user.setPassword(passwordEncoder.encode(tempPassword));

    user.setStatus(UserStatus.APPROVED);
    user.setRejectionReason(null);
    user.setFirstLogin(true);

    userRepository.save(user);

   
    emailService.sendEmail(
            user.getEmail(),
            "Account Approved - Pet Wellness",
            "Your account is approved.\n\n" +
            "Temporary Password: " + tempPassword +
            "\n\nPlease login and set new password."
    );

    return "User approved and approval email sent.";
}

@Override
@Transactional
public String rejectUser(Long userId, String rejectionReason) {

    String reason = rejectionReason == null ? "" : rejectionReason.trim();
    if (reason.isEmpty()) {
        throw new RuntimeException("Rejection reason is required");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getStatus() == UserStatus.APPROVED) {
        throw new RuntimeException("Approved user cannot be rejected");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("User already rejected");
    }

    emailService.sendEmail(
            user.getEmail(),
            "Account Rejected - Pet Wellness",
            "Your account request has been rejected.\n\nReason: " + reason
    );

    addressRepository.deleteByUserId(user.getId());
    personalInfoRepository.deleteByUserId(user.getId());
    userRepository.delete(user);

    return "User rejected, rejection email sent, and user removed successfully.";
}

@Override
@Transactional
public String deleteApprovedUser(Long userId, String deletionReason, String requestedByEmail) {
    String reason = deletionReason == null ? "" : deletionReason.trim();
    if (reason.isEmpty()) {
        throw new RuntimeException("Deletion reason is required");
    }

    User requester = userRepository.findByEmail(requestedByEmail)
            .orElseThrow(() -> new RuntimeException("Authenticated admin not found"));

    if (requester.getId().equals(userId)) {
        throw new RuntimeException("Admin cannot delete its own account");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole() != UserRole.OWNER) {
        throw new RuntimeException("Only owner users can be deleted");
    }

    if (user.getStatus() != UserStatus.APPROVED) {
        throw new RuntimeException("Only approved users can be deleted");
    }

    emailService.sendEmail(
            user.getEmail(),
            "Account Deleted - Pet Wellness",
            "Your approved account has been deleted by Admin.\n\nReason: " + reason
    );

    addressRepository.deleteByUserId(user.getId());
    personalInfoRepository.deleteByUserId(user.getId());
    userRepository.delete(user);

    return "Approved user deleted successfully and deletion email sent.";
}

    @Override
    @Transactional
    public void createOwner(AdminCreateOwnerRequestDto request, MultipartFile idProof, MultipartFile profileImage) {

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("User already exists");
    }

    if (request.getDateOfBirth() == null || !request.getDateOfBirth().isBefore(java.time.LocalDate.now())) {
        throw new BadRequestException("Date of birth must be a past date");
    }

   String tempPassword = "Temp" + System.currentTimeMillis() % 10000;

    String encodedPassword = passwordEncoder.encode(tempPassword);

    String fullName = request.getFullName().trim();
    String firstName = fullName.split("\\s+")[0];

    User user = new User();
    user.setEmail(request.getEmail());
    user.setFullName(fullName);
    user.setFirstName(firstName);
    user.setPassword(encodedPassword);
    user.setIdProofType(request.getIdProofType());

    String idProofPath;
    String profileImagePath;
    try {
        idProofPath = fileStorageUtil.saveFile(idProof, "id-proofs");
        profileImagePath = fileStorageUtil.saveFile(profileImage, "profile-images");
    } catch (RuntimeException ex) {
        throw new BadRequestException("File upload failed: " + ex.getMessage());
    }

    user.setIdProofPath(idProofPath);
    user.setProfileImagePath(profileImagePath);

    user.setRole(UserRole.OWNER);
    user.setEmailVerified(true);
    user.setProfileCompleted(true);
    user.setStatus(UserStatus.APPROVED);
    user.setRejectionReason(null);
    user.setFirstLogin(true);

    userRepository.save(user);

    PersonalInfo personalInfo = new PersonalInfo();
    personalInfo.setUser(user);
    personalInfo.setFullName(fullName);
    personalInfo.setPhoneNumber(request.getPhoneNumber());
    personalInfo.setGender(request.getGender());
    personalInfo.setHighestQualification(request.getHighestQualification());
    personalInfo.setOccupation(request.getOccupation());
    personalInfo.setFatherName(request.getFatherName());
    personalInfo.setMotherName(request.getMotherName());
    personalInfo.setDateOfBirth(request.getDateOfBirth());

    personalInfoRepository.save(personalInfo);

    Address address = new Address();
    address.setUser(user);
    address.setStreet(request.getStreet());
    address.setCity(request.getCity());
    address.setState(request.getState());
    address.setPincode(request.getPincode());

    addressRepository.save(address);

emailService.sendEmail(
        user.getEmail(),
        "Your Owner Account Created - Pet Wellness",
        "Your account has been created by Admin.\n\n" +
        "Temporary Password: " + tempPassword +
        "\n\nPlease login and set your new password."
);

}

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }

    private void validateDashboardYear(int year) {
        if (year < 2000 || year > 2100) {
            throw new BadRequestException("Year must be between 2000 and 2100.");
        }
    }

    private List<AdminDashboardRegistrationTrendDto> buildYearlyRegistrationTrend(List<User> users, int year) {
        int[] monthlyCounts = new int[12];

        for (User user : users) {
            LocalDateTime createdAt = user.getCreatedAt();
            if (createdAt == null || createdAt.getYear() != year) {
                continue;
            }

            monthlyCounts[createdAt.getMonthValue() - 1]++;
        }

        return IntStream.range(0, 12)
                .mapToObj(index -> {
                    Month month = Month.of(index + 1);
                    return new AdminDashboardRegistrationTrendDto(
                            month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                            monthlyCounts[index]
                    );
                })
                .collect(Collectors.toList());
    }

    private List<AdminDashboardAppointmentTrendDto> buildWeeklyAppointmentTrend(List<Appointment> appointments) {
        LocalDate currentWeekStart = LocalDate.now().with(java.time.DayOfWeek.MONDAY);

        return IntStream.range(0, 6)
                .mapToObj(index -> {
                    LocalDate weekStart = currentWeekStart.minusWeeks(5L - index);
                    LocalDate weekEnd = weekStart.plusDays(6);
                    long count = 0;
                    for (Appointment appointment : appointments) {
                        if (appointment == null || appointment.getAppointmentDate() == null) {
                            continue;
                        }
                        LocalDate appointmentDate = appointment.getAppointmentDate();
                        if (!appointmentDate.isBefore(weekStart) && !appointmentDate.isAfter(weekEnd)) {
                            count++;
                        }
                    }

                    String label = weekStart.getDayOfMonth() + " " +
                            weekStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                    return new AdminDashboardAppointmentTrendDto(label, (int) count);
                })
                .collect(Collectors.toList());
    }

    private List<AdminDashboardActivityDto> buildRecentActivities(
            List<User> users,
            List<Appointment> appointments,
            List<Product> products) {
        List<AdminDashboardActivityRow> rows = new java.util.ArrayList<>();

        for (User user : users) {
            if (user.getCreatedAt() == null) {
                continue;
            }

            String text = user.getStatus() == UserStatus.APPROVED
                    ? "Approved owner: " + fallbackText(user.getFullName(), user.getEmail(), "User #" + user.getId())
                    : "Owner registered: " + fallbackText(user.getFullName(), user.getEmail(), "User #" + user.getId());
            rows.add(new AdminDashboardActivityRow(
                    "user-" + user.getId(),
                    text,
                    user.getCreatedAt(),
                    user.getStatus() == UserStatus.APPROVED ? "success" : "info"
            ));
        }

        for (Appointment appointment : appointments) {
            if (appointment.getCreatedAt() == null) {
                continue;
            }

            rows.add(new AdminDashboardActivityRow(
                    "appointment-" + appointment.getId(),
                    "Appointment booked with Dr. " + fallbackText(appointment.getVeterinarianName(), null, "Unknown"),
                    appointment.getCreatedAt(),
                    "info"
            ));
        }

        for (Product product : products) {
            if (product.getCreatedAt() == null) {
                continue;
            }

            rows.add(new AdminDashboardActivityRow(
                    "product-" + product.getId(),
                    "Marketplace listing added: " + fallbackText(product.getProductName(), null, "Product #" + product.getId()),
                    product.getCreatedAt(),
                    "success"
            ));
        }

        return rows.stream()
                .sorted((left, right) -> right.createdAt.compareTo(left.createdAt))
                .limit(8)
                .map(row -> new AdminDashboardActivityDto(
                        row.id,
                        row.text,
                        row.createdAt.toString().replace("T", " "),
                        row.tone
                ))
                .collect(Collectors.toList());
    }

    private String fallbackText(String primary, String secondary, String fallback) {
        if (primary != null && !primary.trim().isEmpty()) {
            return primary.trim();
        }
        if (secondary != null && !secondary.trim().isEmpty()) {
            return secondary.trim();
        }
        return fallback;
    }

    private LocalDateTime latestTimestamp(List<User> users, List<Appointment> appointments, List<Product> products) {
        LocalDateTime latest = null;

        for (User user : users) {
            latest = maxTimestamp(latest, user.getCreatedAt());
        }
        for (Appointment appointment : appointments) {
            latest = maxTimestamp(latest, appointment.getCreatedAt());
        }
        for (Product product : products) {
            latest = maxTimestamp(latest, product.getCreatedAt());
        }

        return latest;
    }

    private LocalDateTime maxTimestamp(LocalDateTime current, LocalDateTime candidate) {
        if (candidate == null) {
            return current;
        }
        if (current == null || candidate.isAfter(current)) {
            return candidate;
        }
        return current;
    }

    private static final class AdminDashboardActivityRow {
        private final String id;
        private final String text;
        private final LocalDateTime createdAt;
        private final String tone;

        private AdminDashboardActivityRow(String id, String text, LocalDateTime createdAt, String tone) {
            this.id = id;
            this.text = text;
            this.createdAt = createdAt;
            this.tone = tone;
        }
    }


}
