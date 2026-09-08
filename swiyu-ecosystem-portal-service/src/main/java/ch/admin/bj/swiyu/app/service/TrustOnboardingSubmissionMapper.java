package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionDto;
import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionRequestDto;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmission;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionRequest;
import java.time.Instant;
import lombok.experimental.UtilityClass;

@UtilityClass
public class TrustOnboardingSubmissionMapper {

    public static TrustOnboardingSubmissionDto toTrustOnboardingSubmissionDto(
        TrustOnboardingSubmission apiDto,
        Instant maxDateForStatus
    ) {
        return new TrustOnboardingSubmissionDto(
            apiDto.getId(),
            apiDto.getVersion(),
            apiDto.getPartnerId(),
            apiDto.getName(),
            apiDto.getEntityEmail(),
            BusinessPartnerMapper.toAddressDto(apiDto.getAddress()),
            BusinessPartnerMapper.toContactDto(apiDto.getContactPerson()),
            apiDto.getSigningRule(),
            apiDto.getSignatories(),
            apiDto.getStatus(),
            apiDto.getProofOfPossessions(),
            apiDto.getBusinessPartnerType(),
            apiDto.getRegistryIds(),
            Boolean.TRUE.equals(apiDto.getIsRegisteredInCommercialRegister()),
            apiDto.getRejectionReason(),
            apiDto.getDeclineReason(),
            apiDto.getPartnerNote(),
            apiDto.getCorrespondingLanguage(),
            apiDto.getInitiatedAt(),
            apiDto.getSubmittedAt(),
            apiDto.getResubmitRequiredUntil(),
            TrustOnboardingAlertEvaluator.evaluate(apiDto, maxDateForStatus)
        );
    }

    public static TrustOnboardingSubmissionRequest toTrustOnboardingSubmissionRequest(
        TrustOnboardingSubmissionRequestDto dto
    ) {
        return new TrustOnboardingSubmissionRequest(
            dto.partnerId(),
            dto.entityName(),
            BusinessPartnerMapper.toAddress(dto.entityAddress()),
            dto.entityEmail(),
            BusinessPartnerMapper.toContact(dto.contactPerson()),
            dto.signingRule(),
            dto.signatories(),
            dto.registryIds(),
            dto.isRegisteredInCommercialRegister(),
            dto.correspondingLanguage(),
            dto.dids(),
            dto.requestedPartnerType()
        );
    }
}
