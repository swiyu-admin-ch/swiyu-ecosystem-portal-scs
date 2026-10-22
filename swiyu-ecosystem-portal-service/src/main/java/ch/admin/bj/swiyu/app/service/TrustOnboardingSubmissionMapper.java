package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionDto;
import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionRequestDto;
import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionTypeDto;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmission;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionRequest;
import java.time.Instant;
import lombok.experimental.UtilityClass;

@UtilityClass
public class TrustOnboardingSubmissionMapper {

    public static TrustOnboardingSubmissionDto toTrustOnboardingSubmissionDto(
        TrustOnboardingSubmission source,
        Instant maxDateForStatus
    ) {
        return new TrustOnboardingSubmissionDto(
            source.getId(),
            source.getVersion(),
            source.getPartnerId(),
            source.getName(),
            source.getEntityEmail(),
            BusinessPartnerMapper.toAddressDto(source.getAddress()),
            BusinessPartnerMapper.toContactDto(source.getContactPerson()),
            source.getSigningRule(),
            source.getSignatories(),
            toTrustOnboardingSubmissionTypeDto(source.getType()),
            source.getStatus(),
            source.getProofOfPossessions(),
            source.getBusinessPartnerType(),
            source.getRegistryIds(),
            Boolean.TRUE.equals(source.getIsRegisteredInCommercialRegister()),
            source.getRejectionReason(),
            source.getDeclineReason(),
            source.getPartnerNote(),
            source.getCorrespondingLanguage(),
            source.getInitiatedAt(),
            source.getSubmittedAt(),
            source.getResubmitRequiredUntil(),
            TrustOnboardingAlertEvaluator.evaluate(source, maxDateForStatus)
        );
    }

    public static TrustOnboardingSubmissionRequest toTrustOnboardingSubmissionRequest(
        TrustOnboardingSubmissionRequestDto source
    ) {
        return new TrustOnboardingSubmissionRequest(
            source.partnerId(),
            source.entityName(),
            BusinessPartnerMapper.toAddress(source.entityAddress()),
            source.entityEmail(),
            BusinessPartnerMapper.toContact(source.contactPerson()),
            source.signingRule(),
            source.signatories(),
            source.registryIds(),
            source.isRegisteredInCommercialRegister(),
            source.dids(),
            source.requestedPartnerType(),
            source.submissionType()
        );
    }

    private static TrustOnboardingSubmissionTypeDto toTrustOnboardingSubmissionTypeDto(
        TrustOnboardingSubmission.TypeEnum source
    ) {
        return switch (source) {
            case REGISTRATION -> TrustOnboardingSubmissionTypeDto.REGISTRATION;
            case PROFILE_CHANGE_MANDATORY -> TrustOnboardingSubmissionTypeDto.PROFILE_CHANGE_MANDATORY;
            case PROFILE_CHANGE_VOLUNTARY -> TrustOnboardingSubmissionTypeDto.PROFILE_CHANGE_VOLUNTARY;
            case RENEWAL -> TrustOnboardingSubmissionTypeDto.RENEWAL;
        };
    }
}
