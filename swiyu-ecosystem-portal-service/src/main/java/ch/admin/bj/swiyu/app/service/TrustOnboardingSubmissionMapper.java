package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionDto;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmission;
import lombok.experimental.UtilityClass;

@UtilityClass
public class TrustOnboardingSubmissionMapper {

    public static TrustOnboardingSubmissionDto toTrustOnboardingSubmissionDto(TrustOnboardingSubmission apiDto) {
        return new TrustOnboardingSubmissionDto(
            apiDto.getId(),
            apiDto.getVersion(),
            apiDto.getPartnerId(),
            apiDto.getEntityName(),
            apiDto.getEntityEmail(),
            apiDto.getAddress(),
            apiDto.getContactPerson(),
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
            apiDto.getSubmittedAt()
        );
    }
}
