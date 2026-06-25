package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Functionality configuration for frontend", name = "FunctionalityConfig")
public record FunctionalityConfigDto(
    @NotNull Boolean automaticApprovalEnabled,
    @NotNull Boolean paymentEnabled,
    @NotNull Boolean allowPartnerBaseOnboardingBusinessEnabled,
    @NotNull Boolean allowPartnerBaseOnboardingIndividualEnabled,
    @NotNull Boolean allowPartnerBaseOnboardingGovernmentalEnabled,
    @NotNull Boolean primaryEnvironmentEnabled
) {}
