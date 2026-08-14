package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.client.business.internal.model.Contact;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationCategory;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Schema(name = "ProtectedVerificationSubmission")
public record ProtectedVerificationSubmissionDto(
    @NotNull UUID id,
    @NotNull UUID partnerId,
    @NotNull UUID sbnId,
    @NotNull String entityName,
    String uid,
    Contact contactPerson,
    @NotNull ProtectedVerificationCategory category,
    @NotNull String reason,
    @NotNull ProtectedVerificationSubmissionStatus status,
    @Schema(example = "2024-10-29T09:35:16.809924Z") Instant submittedAt
) {}
