package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(name = "LatestTrustOnboardingSubmissionRequest")
public record LatestTrustOnboardingSubmissionRequestDto(@NotNull UUID businessPartnerId) {}
