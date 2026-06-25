package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Feature Flags", name = "FeatureToggles")
public record FeatureTogglesDto(@NotNull boolean EIDARTFE_1122) {}
