package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "E-Portal Service Navigation Widget configuration for frontend", name = "EportalConfig")
public record EportalConfigDto(
    @NotNull String pamsAppId,
    @NotNull String infoContactEmail,
    @NotNull PamsEnvironmentDto pamsEnvironment
) {}
