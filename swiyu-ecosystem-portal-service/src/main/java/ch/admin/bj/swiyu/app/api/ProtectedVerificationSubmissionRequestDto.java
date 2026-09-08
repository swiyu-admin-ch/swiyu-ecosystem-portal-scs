package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(name = "ProtectedVerificationSubmissionRequest")
public record ProtectedVerificationSubmissionRequestDto(
    @NotNull UUID partnerId,
    @NotNull UUID sbnId,
    @NotNull String entityName,
    String uid,
    ContactDto contactPerson,
    @NotNull ProtectedVerificationCategory category,
    @NotNull String reason
) {}
