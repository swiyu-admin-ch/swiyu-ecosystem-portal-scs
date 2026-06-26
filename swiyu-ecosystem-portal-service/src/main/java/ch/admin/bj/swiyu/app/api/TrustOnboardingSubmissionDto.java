package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.client.business.internal.model.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Schema(name = "TrustOnboardingSubmission")
public record TrustOnboardingSubmissionDto(
    @NotNull UUID id,
    @NotNull Long version,
    @NotNull UUID partnerId,
    @NotNull Map<String, String> entityName,
    @NotNull String entityEmail,
    @NotNull Address entityAddress,
    @NotNull Contact contactPerson,
    SigningRule signingRule,
    List<Signatory> signatories,
    @NotNull TrustOnboardingSubmissionStatus status,
    @NotNull List<ProofOfPossession> proofOfPossessionList,
    BusinessPartnerType businessPartnerType,
    @NotNull Map<String, String> registryIds,
    boolean isRegisteredInCommercialRegister,
    String rejectionReason,
    String declineReason,
    String partnerNote,
    Language correspondingLanguage,
    @Schema(example = "2024-10-29T09:35:16.809924Z") Instant initiatedAt,
    @Schema(example = "2024-10-29T09:35:16.809924Z") Instant submittedAt
) {}
