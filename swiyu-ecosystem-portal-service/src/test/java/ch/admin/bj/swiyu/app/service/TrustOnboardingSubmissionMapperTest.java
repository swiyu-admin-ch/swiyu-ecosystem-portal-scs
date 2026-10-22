package ch.admin.bj.swiyu.app.service;

import static ch.admin.bj.swiyu.app.service.TrustOnboardingSubmissionMapper.toTrustOnboardingSubmissionDto;
import static ch.admin.bj.swiyu.app.test.TrustOnboardingTestData.defaultSubmission;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class TrustOnboardingSubmissionMapperTest {

    @Test
    void toTrustOnboardingSubmissionDto_whenApiDtoIsValid_thenMapsCorrectly() {
        var source = defaultSubmission();

        // Act
        var target = toTrustOnboardingSubmissionDto(source, null);

        // Assert
        assertEquals(source.getId(), target.id());
        assertEquals(source.getVersion(), target.version());
        assertEquals(source.getPartnerId(), target.partnerId());
        assertEquals(source.getName(), target.entityName());
        assertEquals(source.getEntityEmail(), target.entityEmail());
        assertEquals(BusinessPartnerMapper.toAddressDto(source.getAddress()), target.entityAddress());
        assertEquals(BusinessPartnerMapper.toContactDto(source.getContactPerson()), target.contactPerson());
        assertEquals(source.getStatus(), target.status());
        assertEquals(source.getProofOfPossessions(), target.proofOfPossessionList());
        assertEquals(source.getRegistryIds(), target.registryIds());
        assertEquals(source.getRejectionReason(), target.rejectionReason());
        assertEquals(source.getDeclineReason(), target.declineReason());
        assertEquals(source.getPartnerNote(), target.partnerNote());
        assertEquals(source.getCorrespondingLanguage(), target.correspondingLanguage());
    }

    @Test
    void toTrustOnboardingSubmissionDto_whenSubmittedAtIsNull_thenMapsNull() {
        // Arrange
        var apiDto = defaultSubmission();
        apiDto.setSubmittedAt(null);

        // Act
        var dto = toTrustOnboardingSubmissionDto(apiDto, null);

        // Assert
        assertNull(dto.submittedAt());
    }
}
