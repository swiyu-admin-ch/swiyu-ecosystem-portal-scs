package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import ch.admin.bj.swiyu.app.service.TrustOnboardingSubmissionService;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionDocument;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionDocumentListItem;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class TrustOnboardingSubmissionDocumentControllerTest {

    @Mock
    private TrustOnboardingSubmissionService trustOnboardingSubmissionService;

    private TrustOnboardingSubmissionDocumentController controller;

    private final UUID submissionId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final UUID documentId = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @BeforeEach
    void setUp() {
        controller = new TrustOnboardingSubmissionDocumentController(trustOnboardingSubmissionService);
    }

    @Test
    void listAllDocumentsForTrustOnboarding_delegatesToServiceAndReturnsResult() {
        var pageable = new Pageable(0, 10, Collections.emptyList());
        Page<TrustOnboardingSubmissionDocumentListItem> expected = new PageImpl<>(
            List.of(new TrustOnboardingSubmissionDocumentListItem())
        );
        when(trustOnboardingSubmissionService.listAllDocumentsForTrustOnboarding(submissionId, pageable)).thenReturn(
            expected
        );

        var result = controller.listAllDocumentsForTrustOnboarding(submissionId, pageable);

        assertEquals(expected, result);
        verify(trustOnboardingSubmissionService).listAllDocumentsForTrustOnboarding(submissionId, pageable);
    }

    @Test
    void getDocumentForTrustOnboarding_delegatesToServiceAndReturnsResult() {
        var expected = new TrustOnboardingSubmissionDocument();
        when(trustOnboardingSubmissionService.getDocument(submissionId, documentId)).thenReturn(expected);

        var result = controller.getDocumentForTrustOnboarding(submissionId, documentId);

        assertEquals(expected, result);
        verify(trustOnboardingSubmissionService).getDocument(submissionId, documentId);
    }

    @Test
    void deleteTrustOnboardingSubmissionDocument_delegatesToService() {
        controller.deleteTrustOnboardingSubmissionDocument(submissionId, documentId);

        verify(trustOnboardingSubmissionService).deleteDocument(submissionId, documentId);
        verifyNoMoreInteractions(trustOnboardingSubmissionService);
    }

    @Test
    void uploadTrustOnboardingSubmissionDocument_delegatesToServiceAndReturnsResult() {
        var mockFile = org.mockito.Mockito.mock(org.springframework.web.multipart.MultipartFile.class);
        var expected = new TrustOnboardingSubmissionDocumentListItem();
        when(
            trustOnboardingSubmissionService.uploadTrustOnboardingSubmissionDocument(eq(submissionId), any())
        ).thenReturn(expected);

        var result = controller.uploadTrustOnboardingSubmissionDocument(submissionId, mockFile);

        assertEquals(expected, result);
        verify(trustOnboardingSubmissionService).uploadTrustOnboardingSubmissionDocument(submissionId, mockFile);
    }
}
