package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "RegistrationRequest")
public record RegistrationRequestDto(@NotNull String organizationName, @NotNull String technicalEmailAddress) {}
