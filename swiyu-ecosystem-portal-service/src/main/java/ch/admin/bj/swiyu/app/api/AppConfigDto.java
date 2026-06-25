package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Application configuration for frontend", name = "AppConfig")
public record AppConfigDto(
    @NotBlank String banner,
    @NotBlank String portalUrl,
    @NotNull String productLabel,
    @NotBlank String trustApiUrl,

    // These 3 URLs are presented in the UI for documentation and knowledge only; they are not used in application logic.
    @NotBlank String identifierRegistryApiUrl,
    @NotBlank String statusRegistryApiUrl,
    @NotBlank String apiGatewayAuthUrl,
    @NotBlank String identifierRegistryUrl,
    @NotNull String productLabelColor,
    @NotBlank String eportalUrl,

    @NotNull boolean tokenRefreshEnabled,
    @NotNull int maxBusinessPartnerPerCustomer,
    @NotNull AuthConfigDto authConfig,
    @NotNull EportalConfigDto eportalConfig,
    @NotNull FeatureTogglesDto featureToggles,
    @NotNull EnvironmentsConfigDto environments,
    @NotNull FunctionalityConfigDto functionalityConfig
) {}
