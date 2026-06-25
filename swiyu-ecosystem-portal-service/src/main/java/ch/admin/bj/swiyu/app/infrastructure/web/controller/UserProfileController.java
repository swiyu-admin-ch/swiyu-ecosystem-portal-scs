package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.UserProfileDto;
import ch.admin.bj.swiyu.app.common.security.AuthSupport;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/user-profile")
@Tag(name = "UserProfile", description = "UserProfile API")
@AllArgsConstructor
public class UserProfileController {

    private final AuthSupport authSupport;

    @Operation(summary = "IF-013.102 - Get UserProfile")
    @GetMapping
    public UserProfileDto getUserProfile() {
        var isGovernmental = authSupport.isGovernmentalAllowlistUser();
        return new UserProfileDto(isGovernmental);
    }
}
