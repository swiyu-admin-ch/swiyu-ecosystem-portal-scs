package ch.admin.bj.swiyu.app.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.app.exceptions.DataInvalidException;
import ch.admin.bj.swiyu.client.business.internal.api.TrustOnboardingSubmissionApi;
import ch.admin.bj.swiyu.client.business.internal.model.*;
import ch.admin.bj.swiyu.client.business.internal.model.Language;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.AbstractResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.multipart.MultipartFile;

@ActiveProfiles("test")
@SpringBootTest
class TrustOnboardingSubmissionServiceTest {

    @Autowired
    private TrustOnboardingSubmissionService trustOnboardingSubmissionService;

    @MockitoBean
    private TrustOnboardingSubmissionApi trustOnboardingSubmissionApi;

    @Mock
    private MultipartFile multipartFile;

    private TrustOnboardingSubmissionService service;

    private final UUID submissionId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final UUID documentId = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @BeforeEach
    void setUp() {
        service = new TrustOnboardingSubmissionService(trustOnboardingSubmissionApi);
    }

    @Test
    void getDeclarationOfIntent_shouldForwardOnlyContentTypeAndContentDisposition() {
        var id = UUID.randomUUID();
        var body = new ByteArrayResource("test-pdf".getBytes(StandardCharsets.UTF_8));
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"declaration-of-intent.pdf\"");
        headers.add("X-Upstream-Header", "must-not-be-forwarded");
        var upstreamResponse = new ResponseEntity<Resource>(body, headers, HttpStatus.OK);

        when(
            trustOnboardingSubmissionApi.getDeclarationOfIntentDocumentForTrustOnboardingWithHttpInfo(id, Language.DE)
        ).thenReturn(upstreamResponse);

        var response = trustOnboardingSubmissionService.getDeclarationOfIntent(id, Language.DE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_PDF, response.getHeaders().getContentType());
        assertEquals(
            "attachment; filename=\"declaration-of-intent.pdf\"",
            response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)
        );
        assertFalse(response.getHeaders().containsKey("X-Upstream-Header"));
        assertSame(body, response.getBody());
    }

    @Test
    void listAllDocumentsForTrustOnboarding_returnsPageOfDocuments() {
        var pageable = new Pageable(0, 10, Collections.emptyList());
        var doc1 = new TrustOnboardingSubmissionDocumentListItem();
        var doc2 = new TrustOnboardingSubmissionDocumentListItem();
        var pagedModel = new PagedModelTrustOnboardingSubmissionDocumentListItem();
        pagedModel.setContent(List.of(doc1, doc2));
        when(
            trustOnboardingSubmissionApi.listAllDocumentsForTrustOnboarding(
                submissionId,
                pageable.getPage(),
                pageable.getSize(),
                pageable.getSort()
            )
        ).thenReturn(pagedModel);

        Page<TrustOnboardingSubmissionDocumentListItem> result = service.listAllDocumentsForTrustOnboarding(
            submissionId,
            pageable
        );

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        verify(trustOnboardingSubmissionApi).listAllDocumentsForTrustOnboarding(
            submissionId,
            pageable.getPage(),
            pageable.getSize(),
            pageable.getSort()
        );
    }

    @Test
    void listAllDocumentsForTrustOnboarding_whenNoDocuments_returnsEmptyPage() {
        var pageable = new Pageable(0, 10, Collections.emptyList());
        var pagedModel = new PagedModelTrustOnboardingSubmissionDocumentListItem();
        pagedModel.setContent(Collections.emptyList());
        when(
            trustOnboardingSubmissionApi.listAllDocumentsForTrustOnboarding(
                submissionId,
                pageable.getPage(),
                pageable.getSize(),
                pageable.getSort()
            )
        ).thenReturn(pagedModel);

        Page<TrustOnboardingSubmissionDocumentListItem> result = service.listAllDocumentsForTrustOnboarding(
            submissionId,
            pageable
        );

        assertNotNull(result);
        assertEquals(0, result.getContent().size());
    }

    @Test
    void getDocument_returnsDocumentFromApi() {
        var expected = new TrustOnboardingSubmissionDocument();
        when(trustOnboardingSubmissionApi.getDocumentForTrustOnboarding(submissionId, documentId)).thenReturn(expected);

        var result = service.getDocument(submissionId, documentId);

        assertEquals(expected, result);
        verify(trustOnboardingSubmissionApi).getDocumentForTrustOnboarding(submissionId, documentId);
    }

    @Test
    void deleteDocument_delegatesToApi() {
        service.deleteDocument(submissionId, documentId);

        verify(trustOnboardingSubmissionApi).deleteTrustOnboardingSubmissionDocument(submissionId, documentId);
    }

    @Test
    void uploadTrustOnboardingSubmissionDocument_delegatesToApiWithDeclarationOfIntentType() {
        var expected = new TrustOnboardingSubmissionDocumentListItem();
        when(
            trustOnboardingSubmissionApi.uploadTrustOnboardingSubmissionDocument(
                eq(submissionId),
                eq(TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_DECLARATION_OF_INTENT),
                any(AbstractResource.class)
            )
        ).thenReturn(expected);

        var result = service.uploadTrustOnboardingSubmissionDocument(submissionId, multipartFile);

        assertEquals(expected, result);
        verify(trustOnboardingSubmissionApi).uploadTrustOnboardingSubmissionDocument(
            eq(submissionId),
            eq(TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_DECLARATION_OF_INTENT),
            any(AbstractResource.class)
        );
    }

    private TrustOnboardingSubmission submissionWith(BusinessPartnerType type, Boolean registeredInCommercialRegister) {
        var submission = new TrustOnboardingSubmission();
        submission.setBusinessPartnerType(type);
        submission.setIsRegisteredInCommercialRegister(registeredInCommercialRegister);
        return submission;
    }

    @Test
    void uploadOtherDocument_forUnregisteredBusiness_delegatesToApiWithOtherType() {
        when(trustOnboardingSubmissionApi.getTrustOnboardingSubmission(submissionId)).thenReturn(
            submissionWith(BusinessPartnerType.BUSINESS, false)
        );
        var expected = new TrustOnboardingSubmissionDocumentListItem();
        when(
            trustOnboardingSubmissionApi.uploadTrustOnboardingSubmissionDocument(
                eq(submissionId),
                eq(TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_OTHER),
                any(AbstractResource.class)
            )
        ).thenReturn(expected);

        var result = service.uploadTrustOnboardingSubmissionOtherDocument(submissionId, multipartFile);

        assertEquals(expected, result);
        verify(trustOnboardingSubmissionApi).uploadTrustOnboardingSubmissionDocument(
            eq(submissionId),
            eq(TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_OTHER),
            any(AbstractResource.class)
        );
    }

    @Test
    void uploadOtherDocument_forGovernmentalInstitution_delegatesEvenWhenRegistered() {
        when(trustOnboardingSubmissionApi.getTrustOnboardingSubmission(submissionId)).thenReturn(
            submissionWith(BusinessPartnerType.GOVERNMENTAL_INSTITUTION, true)
        );
        var expected = new TrustOnboardingSubmissionDocumentListItem();
        when(
            trustOnboardingSubmissionApi.uploadTrustOnboardingSubmissionDocument(
                eq(submissionId),
                eq(TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_OTHER),
                any(AbstractResource.class)
            )
        ).thenReturn(expected);

        var result = service.uploadTrustOnboardingSubmissionOtherDocument(submissionId, multipartFile);

        assertEquals(expected, result);
    }

    @Test
    void uploadOtherDocument_forRegisteredBusiness_throwsDataInvalid() {
        when(trustOnboardingSubmissionApi.getTrustOnboardingSubmission(submissionId)).thenReturn(
            submissionWith(BusinessPartnerType.BUSINESS, true)
        );

        var exception = assertThrows(DataInvalidException.class, () ->
            service.uploadTrustOnboardingSubmissionOtherDocument(submissionId, multipartFile)
        );
        assertEquals(BusinessErrorCode.DATA_INVALID, exception.getErrorCode());
        verify(trustOnboardingSubmissionApi, org.mockito.Mockito.never()).uploadTrustOnboardingSubmissionDocument(
            any(),
            any(),
            any()
        );
    }

    @Test
    void uploadOtherDocument_forIndividual_throwsDataInvalid() {
        when(trustOnboardingSubmissionApi.getTrustOnboardingSubmission(submissionId)).thenReturn(
            submissionWith(BusinessPartnerType.INDIVIDUAL, false)
        );

        assertThrows(DataInvalidException.class, () ->
            service.uploadTrustOnboardingSubmissionOtherDocument(submissionId, multipartFile)
        );
    }
}
