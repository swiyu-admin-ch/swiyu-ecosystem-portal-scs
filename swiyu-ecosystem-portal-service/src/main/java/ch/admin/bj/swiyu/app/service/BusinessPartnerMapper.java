package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.*;
import ch.admin.bj.swiyu.client.business.internal.model.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BusinessPartnerMapper {

    @SuppressWarnings({ "java:S1874" }) // Remove name with contract in EID-6303
    public static BusinessPartnerListItemDto toBusinessPartnerListItemDto(BusinessPartnerListItem businessPartner) {
        return new BusinessPartnerListItemDto(
            businessPartner.getId(),
            businessPartner.getName(),
            toBusinessPartnerTypeDto(businessPartner.getType()),
            businessPartner.getPayedForTrustVerification(),
            businessPartner.getPayedForDIDSlots(),
            businessPartner.getCreatedAt(),
            businessPartner.getUpdatedAt(),
            toBusinessPartnerTrustStatusDto(businessPartner.getTrustVerificationStatus()),
            businessPartner.getMaxDateForTrustVerificationStatus(),
            daysUntil(businessPartner.getMaxDateForTrustVerificationStatus())
        );
    }

    private static BusinessPartnerTrustStatusDto toBusinessPartnerTrustStatusDto(BusinessPartnerTrustStatus source) {
        return switch (source) {
            case NOT_VERIFIED -> BusinessPartnerTrustStatusDto.NOT_VERIFIED;
            case VERIFIED -> BusinessPartnerTrustStatusDto.VERIFIED;
            case VERIFICATION_STARTED -> BusinessPartnerTrustStatusDto.VERIFICATION_STARTED;
            case VERIFICATION_IN_PROGRESS -> BusinessPartnerTrustStatusDto.VERIFICATION_IN_PROGRESS;
            case RE_VERIFICATION_STARTED -> BusinessPartnerTrustStatusDto.RE_VERIFICATION_STARTED;
            case RE_VERIFICATION_IN_PROGRESS -> BusinessPartnerTrustStatusDto.RE_VERIFICATION_IN_PROGRESS;
            case INFORMATION_REQUESTED -> BusinessPartnerTrustStatusDto.INFORMATION_REQUESTED;
            case null -> null;
        };
    }

    private static BusinessPartnerTypeDto toBusinessPartnerTypeDto(BusinessPartnerType source) {
        return switch (source) {
            case UNKNOWN -> BusinessPartnerTypeDto.UNKNOWN;
            case BUSINESS -> BusinessPartnerTypeDto.BUSINESS;
            case INDIVIDUAL -> BusinessPartnerTypeDto.INDIVIDUAL;
            case GOVERNMENTAL_INSTITUTION -> BusinessPartnerTypeDto.GOVERNMENTAL_INSTITUTION;
        };
    }

    @SuppressWarnings({ "java:S1874" }) // Remove name with contract in EID-6303
    public static BusinessPartnerDto toBusinessPartnerDto(BusinessPartner businessPartner) {
        if (businessPartner == null) return null;
        return new BusinessPartnerDto(
            businessPartner.getId(),
            businessPartner.getName(),
            businessPartner.getEntityName(),
            businessPartner.getContactEmailAddress(),
            toBusinessPartnerTypeDto(businessPartner.getType()),
            Boolean.TRUE.equals(businessPartner.getPayedForTrustVerification()),
            businessPartner.getPayedForDIDSlots(),
            businessPartner.getCreatedAt(),
            businessPartner.getUpdatedAt(),
            businessPartner.getUid(),
            toAddressDto(businessPartner.getAddress()),
            businessPartner.getContactPhone(),
            toBusinessPartnerTrustStatusDto(businessPartner.getTrustVerificationStatus()),
            businessPartner.getMaxDateForTrustVerificationStatus(),
            daysUntil(businessPartner.getMaxDateForTrustVerificationStatus())
        );
    }

    private static Long daysUntil(Instant deadline) {
        if (deadline == null) return null;
        return ChronoUnit.DAYS.between(LocalDate.now(ZoneOffset.UTC), deadline.atZone(ZoneOffset.UTC).toLocalDate());
    }

    private static AddressDto toAddressDto(Address address) {
        if (address == null) return null;
        return new AddressDto(
            address.getStreet(),
            address.getCity(),
            address.getPostalCode(),
            address.getCountry(),
            address.getRegion()
        );
    }

    public static CreatePartner toCreatePartner(PartnerCreationRequestDto partnerCreationRequestDto) {
        return new CreatePartner(
            partnerCreationRequestDto.organizationName(),
            partnerCreationRequestDto.businessPartnerType(),
            partnerCreationRequestDto.uid(),
            partnerCreationRequestDto.addressStreet(),
            partnerCreationRequestDto.addressZipCode(),
            partnerCreationRequestDto.addressCity(),
            partnerCreationRequestDto.addressCountry(),
            partnerCreationRequestDto.addressRegion(),
            partnerCreationRequestDto.contactPhone(),
            partnerCreationRequestDto.contactEmail()
        );
    }
}
