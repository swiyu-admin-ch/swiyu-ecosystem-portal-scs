package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "PartnerCreationResponse")
public record PartnerCreationResponseDto(@NotNull String id, @NotNull String name, String contactEmailAddress) {}
