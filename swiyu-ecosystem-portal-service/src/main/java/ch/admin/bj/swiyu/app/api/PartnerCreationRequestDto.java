package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "PartnerCreationRequest")
public record PartnerCreationRequestDto(
    @Nullable String uid,
    @NotBlank String organizationName,
    @NotNull AddressDto address,
    @NotNull ContactDto contact,
    @NotNull BusinessPartnerType businessPartnerType
) {}
