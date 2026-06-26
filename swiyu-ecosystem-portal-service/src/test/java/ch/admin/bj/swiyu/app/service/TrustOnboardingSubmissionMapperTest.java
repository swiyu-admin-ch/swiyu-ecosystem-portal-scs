package ch.admin.bj.swiyu.app.service;

import static ch.admin.bj.swiyu.app.test.TrustOnboardingTestData.defaultSubmission;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionDto;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmission;
import org.junit.jupiter.api.Test;

class TrustOnboardingSubmissionMapperTest {

    @Test
    void toTrustOnboardingSubmissionDto_whenApiDtoIsValid_thenMapsCorrectly() {
        var apiDto = defaultSubmission();

        // Act
        TrustOnboardingSubmissionDto dto = TrustOnboardingSubmissionMapper.toTrustOnboardingSubmissionDto(apiDto);

        // Assert
        assertEquals(apiDto.getId(), dto.id());
        assertEquals(apiDto.getVersion(), dto.version());
        assertEquals(apiDto.getPartnerId(), dto.partnerId());
        assertEquals(apiDto.getName(), dto.entityName());
        assertEquals(apiDto.getEntityEmail(), dto.entityEmail());
        assertEquals(apiDto.getAddress(), dto.entityAddress());
        assertEquals(apiDto.getContactPerson(), dto.contactPerson());
        assertEquals(apiDto.getStatus(), dto.status());
        assertEquals(apiDto.getProofOfPossessions(), dto.proofOfPossessionList());
        assertEquals(apiDto.getRegistryIds(), dto.registryIds());
        assertEquals(apiDto.getRejectionReason(), dto.rejectionReason());
        assertEquals(apiDto.getDeclineReason(), dto.declineReason());
        assertEquals(apiDto.getPartnerNote(), dto.partnerNote());
        assertEquals(apiDto.getCorrespondingLanguage(), dto.correspondingLanguage());
    }

    @Test
    void toTrustOnboardingSubmissionDto_whenSubmittedAtIsNull_thenMapsNull() {
        // Arrange
        var apiDto = new TrustOnboardingSubmission();
        apiDto.setSubmittedAt(null);

        // Act
        TrustOnboardingSubmissionDto dto = TrustOnboardingSubmissionMapper.toTrustOnboardingSubmissionDto(apiDto);

        // Assert
        assertNull(dto.submittedAt());
    }
}
