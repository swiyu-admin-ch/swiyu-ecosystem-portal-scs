package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.ProtectedVerificationSubmissionDto;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmission;
import lombok.experimental.UtilityClass;

@UtilityClass
public class ProtectedVerificationSubmissionMapper {

    public static ProtectedVerificationSubmissionDto toProtectedVerificationSubmissionDto(
        ProtectedVerificationSubmission apiDto
    ) {
        return new ProtectedVerificationSubmissionDto(
            apiDto.getId(),
            apiDto.getPartnerId(),
            apiDto.getSbnId(),
            apiDto.getEntityName(),
            apiDto.getUid(),
            apiDto.getContactPerson(),
            apiDto.getCategory(),
            apiDto.getReason(),
            apiDto.getStatus(),
            apiDto.getSubmittedAt()
        );
    }
}
