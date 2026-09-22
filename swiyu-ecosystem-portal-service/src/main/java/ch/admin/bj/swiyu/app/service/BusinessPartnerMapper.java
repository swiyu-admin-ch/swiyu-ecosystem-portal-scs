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
        return toBusinessPartnerListItemDto(businessPartner, null);
    }

    @SuppressWarnings({ "java:S1874" }) // Remove name with contract in EID-6303
    public static BusinessPartnerListItemDto toBusinessPartnerListItemDto(
        BusinessPartnerListItem businessPartner,
        Instant verificationProgressMaxDate
    ) {
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
            daysUntil(businessPartner.getMaxDateForTrustVerificationStatus()),
            verificationProgressMaxDate,
            daysUntil(verificationProgressMaxDate)
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
            case BUSINESS -> BusinessPartnerTypeDto.BUSINESS;
            case INDIVIDUAL -> BusinessPartnerTypeDto.INDIVIDUAL;
            case GOVERNMENTAL_INSTITUTION -> BusinessPartnerTypeDto.GOVERNMENTAL_INSTITUTION;
        };
    }

    @SuppressWarnings({ "java:S1874" }) // Remove name with contract in EID-6303
    public static BusinessPartnerDto toBusinessPartnerDto(BusinessPartner businessPartner) {
        return toBusinessPartnerDto(businessPartner, null);
    }

    @SuppressWarnings({ "java:S1874" }) // Remove name with contract in EID-6303
    public static BusinessPartnerDto toBusinessPartnerDto(
        BusinessPartner businessPartner,
        Instant verificationProgressMaxDate
    ) {
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
            toContactDto(businessPartner.getContact()),
            businessPartner.getContactPhone(),
            toBusinessPartnerTrustStatusDto(businessPartner.getTrustVerificationStatus()),
            businessPartner.getMaxDateForTrustVerificationStatus(),
            daysUntil(businessPartner.getMaxDateForTrustVerificationStatus()),
            toBusinessPartnerIdentityDto(businessPartner.getBusinessPartnerIdentity()),
            verificationProgressMaxDate,
            daysUntil(verificationProgressMaxDate)
        );
    }

    private static BusinessPartnerIdentityDto toBusinessPartnerIdentityDto(BusinessPartnerIdentity source) {
        if (source == null) {
            return null;
        }

        return new BusinessPartnerIdentityDto(
            source.getValidUntil(),
            source.getTrustedIdentifier(),
            toBusinessPartnerIdentityStatusDto(source.getStatus()),
            source.getLastActivated(),
            source.getUid(),
            source.getEntityName()
        );
    }

    private static BusinessPartnerIdentityStatusDto toBusinessPartnerIdentityStatusDto(
        BusinessPartnerIdentityStatus source
    ) {
        return switch (source) {
            case ACTIVE -> BusinessPartnerIdentityStatusDto.ACTIVE;
            case DEACTIVATED -> BusinessPartnerIdentityStatusDto.DEACTIVATED;
            case null -> null;
        };
    }

    private static Long daysUntil(Instant deadline) {
        if (deadline == null) return null;
        return ChronoUnit.DAYS.between(LocalDate.now(ZoneOffset.UTC), deadline.atZone(ZoneOffset.UTC).toLocalDate());
    }

    static AddressDto toAddressDto(Address address) {
        if (address == null) return null;
        return new AddressDto(
            address.getStreet(),
            address.getCity(),
            address.getPostalCode(),
            address.getCountry(),
            address.getRegion()
        );
    }

    private static LanguageDto toLanguageDto(Language language) {
        if (language == null) return null;
        return LanguageDto.valueOf(language.getValue());
    }

    @SuppressWarnings("java:S1874") // remove with EID-6303
    static ContactDto toContactDto(Contact contact) {
        if (contact == null) return null;
        return new ContactDto(
            contact.getFirstName(),
            contact.getLastName(),
            contact.getEmail(),
            contact.getPhone(),
            toLanguageDto(contact.getCorrespondingLanguage()),
            toAddressDto(contact.getAddress())
        );
    }

    public static CreatePartner toCreatePartner(PartnerCreationRequestDto partnerCreationRequestDto) {
        return new CreatePartner(
            partnerCreationRequestDto.organizationName(),
            partnerCreationRequestDto.businessPartnerType(),
            partnerCreationRequestDto.uid(),
            toAddress(partnerCreationRequestDto.address()),
            toContact(partnerCreationRequestDto.contact())
        );
    }

    public static BusinessPartnerUpdate toBusinessPartnerUpdate(BusinessPartnerUpdateRequestDto dto) {
        return new BusinessPartnerUpdate(dto.name(), dto.uid(), toAddress(dto.address()), toContact(dto.contact()));
    }

    static Address toAddress(AddressDto dto) {
        if (dto == null) return null;
        return new Address(dto.street(), dto.city(), dto.postalCode(), dto.country(), dto.region());
    }

    static Contact toContact(ContactDto dto) {
        if (dto == null) return null;
        return new Contact(
            dto.firstName(),
            dto.lastName(),
            dto.email(),
            dto.phone(),
            toLanguage(dto.correspondingLanguage()),
            null // deprecated address field — never sent on update
        );
    }

    private static Language toLanguage(LanguageDto dto) {
        if (dto == null) return null;
        return Language.fromValue(dto.name());
    }
}
