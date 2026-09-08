package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;

/**
 * Request body for updating a business partner's profile.
 * All fields are optional — only non-null fields will be applied by the CBS.
 * {@code name} and {@code uid} are only updatable when the partner identity is not yet ACTIVE.
 */
@Schema(name = "BusinessPartnerUpdateRequest")
public record BusinessPartnerUpdateRequestDto(
    @Schema(description = "Self-declared organisation name. Only updatable when identity is not yet ACTIVE.")
    String name,

    @Schema(description = "Enterprise identification number (UID). Only updatable when identity is not yet ACTIVE.")
    String uid,

    @Schema(description = "Address of the organisation") @Valid AddressDto address,

    @Schema(description = "Contact person details") @Valid ContactDto contact
) {}
