package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.AdminDashboardOverviewResponseDto;
import com.petcare.petwellness.DTO.Response.AdminUserProfileResponseDto;
import com.petcare.petwellness.DTO.Response.ApprovedUserResponseDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface AdminService {

    Page<PendingUserResponseDto> getPendingUsers(int offset, int limit);

    Page<ApprovedUserResponseDto> getApprovedUsers(int offset, int limit);

    AdminDashboardOverviewResponseDto getDashboardOverview(Integer year);

    AdminUserProfileResponseDto getUserProfile(Long userId);

    String approveUser(Long userId);

    String rejectUser(Long userId, String rejectionReason);

    String deleteApprovedUser(Long userId, String deletionReason, String requestedByEmail);

    void createOwner(AdminCreateOwnerRequestDto request, MultipartFile idProof, MultipartFile profileImage);

}
