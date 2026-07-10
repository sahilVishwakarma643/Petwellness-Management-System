package com.petcare.petwellness.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.UserDashboardResponseDTO;
import com.petcare.petwellness.Service.UserDashboardSummaryService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;

@RestController
@RequestMapping("/api/user/dashboard")
public class UserDashboardSummaryController {

    private final UserDashboardSummaryService userDashboardSummaryService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public UserDashboardSummaryController(
            UserDashboardSummaryService userDashboardSummaryService,
            AuthenticatedUserUtil authenticatedUserUtil) {
        this.userDashboardSummaryService = userDashboardSummaryService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @GetMapping("/summary")
    public ResponseEntity<UserDashboardResponseDTO> getDashboardSummary(Authentication authentication) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(userDashboardSummaryService.getUserDashboardSummary(userId));
    }
}
