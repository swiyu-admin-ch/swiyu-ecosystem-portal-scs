package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Normal and preview environment configuration for frontend", name = "EnvironmentsConfig")
public record EnvironmentsConfigDto(@NotBlank String primaryBaseUrl, String integrationBaseUrl) {}
