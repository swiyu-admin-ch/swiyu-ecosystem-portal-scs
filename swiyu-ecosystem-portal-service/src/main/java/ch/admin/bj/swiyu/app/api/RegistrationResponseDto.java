package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "RegistrationResponse")
public record RegistrationResponseDto(@NotNull String id, @NotNull String name, @NotNull String contactEmailAddress) {}
