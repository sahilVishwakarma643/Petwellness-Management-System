package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.UserDashboardResponseDTO;

public interface UserDashboardSummaryService {

    UserDashboardResponseDTO getUserDashboardSummary(Long userId);
}
