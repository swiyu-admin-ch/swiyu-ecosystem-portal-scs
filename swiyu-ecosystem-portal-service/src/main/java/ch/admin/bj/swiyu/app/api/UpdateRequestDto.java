package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UpdateRequest")
public record UpdateRequestDto(@NotNull String organizationName, @NotNull String technicalEmailAddress) {}
