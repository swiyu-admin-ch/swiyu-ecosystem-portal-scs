package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static java.util.Collections.emptyList;

import ch.admin.bj.swiyu.app.api.*;
import ch.admin.bj.swiyu.app.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registration")
@Tag(name = "Registration", description = "Registration API")
@AllArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PreAuthorize("hasRole('businesspartner','read')")
    @PostAuthorize("@authSupport.hasRoleForPartners('businesspartner', 'read', returnObject.content.![id])")
    @Operation(summary = "IF-013.001 - Get registrations")
    @GetMapping
    public PageDto<RegistrationResponseDto> getRegistrations(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        var pageable = new Pageable(page, size, emptyList());
        return this.registrationService.getRegistrations(pageable);
    }

    @Operation(
        summary = "IF-013.002 - Register organization",
        description = "Register a new organization",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Organization registered successfully",
                content = @Content(schema = @Schema(implementation = RegistrationResponseDto.class))
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Bad request",
                content = @Content(schema = @Schema(implementation = ApiErrorDto.class))
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(schema = @Schema(implementation = ApiErrorDto.class))
            ),
        }
    )
    @PreAuthorize("isAuthenticated()") // any user that is logged in can register an organization
    @PostMapping("/register")
    public RegistrationResponseDto registerOrganization(@RequestBody RegistrationRequestDto registration) {
        return this.registrationService.register(registration);
    }

    @Operation(summary = "IF-013.003 - Update organization")
    @PreAuthorize("hasRoleForPartner('businesspartner','write',#id)")
    @PostMapping("/update/{id}")
    public RegistrationResponseDto updateOrganization(@PathVariable String id, @RequestBody UpdateRequestDto update) {
        return this.registrationService.updateOrganisation(id, update);
    }

    @Operation(summary = "IF-013.004 - Get organization")
    @PreAuthorize("hasRoleForPartner('businesspartner','read',#id)")
    @GetMapping("/{id}")
    public RegistrationResponseDto getRegistration(@PathVariable String id) {
        return this.registrationService.getRegistration(id);
    }
}
