package ch.admin.bj.swiyu.app.common.config;

import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Properties for enabling or disabling certain functionalities of the application.
 *
 * @param automaticApprovalEnabled                      If enabled UI wording implies trust onboarding submissions will be automatically approved without manual BJ approval
 * @param paymentEnabled                                If disabled payment steps are not visible in the UI
 * @param allowPartnerBaseOnboardingBusinessEnabled     If enabled base onboarding for partners of type business can be made
 * @param allowPartnerBaseOnboardingIndividualEnabled   If enabled base onboarding for partners of type individual can be made
 * @param allowPartnerBaseOnboardingGovernmentalEnabled If enabled base onboarding for partners of type governmental can be made
 * @param primaryEnvironmentEnabled                     If disabled the primary (production) environment card is not selectable in the product selection step
 */
@Validated
@ConfigurationProperties(prefix = "app.functionality")
public record FunctionalityProperties(
    @NotNull Boolean automaticApprovalEnabled,
    @NotNull Boolean paymentEnabled,
    @NotNull Boolean allowPartnerBaseOnboardingBusinessEnabled,
    @NotNull Boolean allowPartnerBaseOnboardingIndividualEnabled,
    @NotNull Boolean allowPartnerBaseOnboardingGovernmentalEnabled,
    @NotNull Boolean primaryEnvironmentEnabled
) {}
