package ch.admin.bj.swiyu.app.infrastructure.web.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.frontend")
public record FrontendProperties(
    @NotNull String banner,
    @NotBlank String portalUrl,
    @NotBlank String trustApiUrl, // displayed on the technical verification step
    @NotBlank String identifierRegistryApiUrl,
    @NotBlank String statusRegistryApiUrl,
    @NotBlank String apiGatewayAuthUrl,
    @NotBlank String identifierRegistryUrl,
    @NotNull String productLabel,
    @NotNull String productLabelColor,
    @NotBlank String eportalUrl,
    @NotNull boolean tokenRefreshEnabled,
    @NotNull int maxBusinessPartnerPerCustomer,
    @NotNull AuthProperties auth,
    @NotNull EportalProperties eportal,
    @NotNull EnvironmentsProperties environments
) {
    /**
     * Required authorization parameters needed in frontend to handle the OAuth login.
     *
     * @param issuer The issuer's uri.
     * @param clientId The client's id as registered with the auth server
     * @param scope The scopes the client should request
     * @param responseType The type of authorization flow to be used, should be 'code' for all stages
     * @param requireHttps Whether the frontend requires https (should only be false for local development)
     */
    public record AuthProperties(
        @NotBlank String issuer,
        @NotBlank String clientId,
        @NotBlank String scope,
        @NotBlank String responseType,
        @NotNull Boolean requireHttps
    ) {}

    /**
     * Required parameters to make the service navigation widget for Eportal (aka Header Widget) work in fronted.
     *
     * @param pamsAppId
     * @param infoContactEmail
     * @param environment the specific PAMS environment to be used by the widget
     */
    public record EportalProperties(
        @NotBlank String pamsAppId,
        @NotBlank String infoContactEmail,
        @NotNull PamsEnvironment environment
    ) {}

    public enum PamsEnvironment {
        DEV,
        REF,
        TEST,
        ABN,
        PROD,
    }

    /**
     * Required parameters to allow switching between normal and preview environment.
     * @param primaryBaseUrl normal environment (DEV, REF, ABN, PROD)
     * @param integrationBaseUrl preview environment (INT-ABN, INT-PROD)
     */
    public record EnvironmentsProperties(@NotBlank String primaryBaseUrl, String integrationBaseUrl) {}
}
