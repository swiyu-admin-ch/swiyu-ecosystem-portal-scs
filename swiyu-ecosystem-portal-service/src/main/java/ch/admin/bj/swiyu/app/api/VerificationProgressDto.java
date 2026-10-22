package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(name = "VerificationProgress")
public record VerificationProgressDto(
    @Schema(description = "Current state of the identity verification process") VerificationProgressStatusDto status,
    @Schema(
        description = "Deadline by which the current verification step must be completed, or null if no deadline applies for the current state."
    )
    Instant maxDateForStatus
) {}
