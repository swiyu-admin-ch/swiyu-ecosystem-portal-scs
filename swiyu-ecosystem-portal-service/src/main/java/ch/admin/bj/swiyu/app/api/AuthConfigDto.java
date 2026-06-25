package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Auth configuration for frontend", name = "AuthConfig")
public record AuthConfigDto(
    @NotBlank String issuer,
    @NotBlank String clientId,
    @NotBlank String scope,
    @NotBlank String responseType,
    @NotNull Boolean requireHttps
) {}
