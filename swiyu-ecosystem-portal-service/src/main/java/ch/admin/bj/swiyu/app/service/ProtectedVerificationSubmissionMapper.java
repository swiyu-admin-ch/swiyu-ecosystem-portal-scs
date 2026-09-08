package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.ProtectedVerificationSubmissionDto;
import ch.admin.bj.swiyu.app.api.ProtectedVerificationSubmissionRequestDto;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmission;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionRequest;
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
            BusinessPartnerMapper.toContactDto(apiDto.getContactPerson()),
            apiDto.getCategory(),
            apiDto.getReason(),
            apiDto.getStatus(),
            apiDto.getSubmittedAt()
        );
    }

    public static ProtectedVerificationSubmissionRequest toProtectedVerificationSubmissionRequest(
        ProtectedVerificationSubmissionRequestDto dto
    ) {
        return new ProtectedVerificationSubmissionRequest(
            dto.partnerId(),
            dto.sbnId(),
            dto.entityName(),
            dto.uid(),
            BusinessPartnerMapper.toContact(dto.contactPerson()),
            dto.category(),
            dto.reason()
        );
    }
}
