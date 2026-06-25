package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UserProfile")
public record UserProfileDto(
    @Schema(
        description = "If true the user is within the Swiyu Governmental Allowlist which allows the creation of Business Partners without payment."
    )
    @NotNull
    Boolean isGovernmental
) {}
