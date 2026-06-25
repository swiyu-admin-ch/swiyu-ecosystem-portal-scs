package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "PartnerCreationRequest")
public record PartnerCreationRequestDto(
    @Nullable String uid,
    @NotBlank String organizationName,
    @Nullable String addressStreet,
    @NotBlank String addressZipCode,
    @NotBlank String addressCity,
    @Nullable String addressCountry,
    @Nullable String addressRegion,
    @NotBlank String contactPhone,
    @NotBlank String contactEmail,
    @NotBlank BusinessPartnerType businessPartnerType
) {}
