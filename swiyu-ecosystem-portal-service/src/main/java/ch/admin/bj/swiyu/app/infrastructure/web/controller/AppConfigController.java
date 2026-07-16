package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.*;
import ch.admin.bj.swiyu.app.common.config.FunctionalityProperties;
import ch.admin.bj.swiyu.app.common.features.FeaturesProperties;
import ch.admin.bj.swiyu.app.infrastructure.web.config.FrontendProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/app-config")
@Tag(name = "AppConfig", description = "App Configuration API")
@RequiredArgsConstructor
@Slf4j
public class AppConfigController {

    private final FrontendProperties frontendProperties;
    private final FeaturesProperties featuresProperties;
    private final FunctionalityProperties functionalityProperties;

    @Operation(summary = "IF-013.101 - Application configuration for frontend")
    @GetMapping
    public AppConfigDto getConfiguration() {
        log.info("Get application configuration");

        var authConfig = frontendProperties.auth();
        var eportalConfig = frontendProperties.eportal();

        return new AppConfigDto(
            frontendProperties.banner(),
            frontendProperties.portalUrl(),
            frontendProperties.productLabel(),
            frontendProperties.trustApiUrl(),
            frontendProperties.identifierRegistryApiUrl(),
            frontendProperties.statusRegistryApiUrl(),
            frontendProperties.apiGatewayAuthUrl(),
            frontendProperties.identifierRegistryUrl(),
            frontendProperties.productLabelColor(),
            frontendProperties.eportalUrl(),
            frontendProperties.tokenRefreshEnabled(),
            frontendProperties.maxBusinessPartnerPerCustomer(),
            new AuthConfigDto(
                authConfig.issuer(),
                authConfig.clientId(),
                authConfig.scope(),
                authConfig.responseType(),
                authConfig.requireHttps()
            ),
            new EportalConfigDto(
                eportalConfig.pamsAppId(),
                eportalConfig.infoContactEmail(),
                toPamsEnvironmentDto(eportalConfig.environment())
            ),
            new FeatureTogglesDto(featuresProperties.getEidartfe1122()),
            new EnvironmentsConfigDto(
                frontendProperties.environments().primaryBaseUrl(),
                frontendProperties.environments().integrationBaseUrl()
            ),
            new FunctionalityConfigDto(
                functionalityProperties.automaticApprovalEnabled(),
                functionalityProperties.paymentEnabled(),
                functionalityProperties.allowPartnerBaseOnboardingBusinessEnabled(),
                functionalityProperties.allowPartnerBaseOnboardingIndividualEnabled(),
                functionalityProperties.allowPartnerBaseOnboardingGovernmentalEnabled(),
                functionalityProperties.primaryEnvironmentEnabled()
            )
        );
    }

    private PamsEnvironmentDto toPamsEnvironmentDto(FrontendProperties.PamsEnvironment environment) {
        return switch (environment) {
            case DEV -> PamsEnvironmentDto.DEV;
            case REF -> PamsEnvironmentDto.REF;
            case TEST -> PamsEnvironmentDto.TEST;
            case ABN -> PamsEnvironmentDto.ABN;
            case PROD -> PamsEnvironmentDto.PROD;
        };
    }
}
