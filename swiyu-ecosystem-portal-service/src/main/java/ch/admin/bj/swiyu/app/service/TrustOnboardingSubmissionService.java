package ch.admin.bj.swiyu.app.service;

import static ch.admin.bj.swiyu.app.service.TrustOnboardingSubmissionMapper.toTrustOnboardingSubmissionDto;

import ch.admin.bj.swiyu.app.api.LatestTrustOnboardingSubmissionRequestDto;
import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionDto;
import ch.admin.bj.swiyu.app.common.stream.MultipartFileResource;
import ch.admin.bj.swiyu.app.domain.BusinessPartnerValidator;
import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.app.exceptions.DataInvalidException;
import ch.admin.bj.swiyu.client.business.internal.api.TrustOnboardingSubmissionApi;
import ch.admin.bj.swiyu.client.business.internal.model.*;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@AllArgsConstructor
public class TrustOnboardingSubmissionService {

    private final TrustOnboardingSubmissionApi trustOnboardingSubmissionApi;
    private final BusinessPartnerValidator businessPartnerValidator;

    public TrustOnboardingSubmissionDto createTrustOnboardingSubmission(TrustOnboardingSubmissionRequest dto) {
        return toTrustOnboardingSubmissionDto(this.trustOnboardingSubmissionApi.createOnboardingSubmission(dto));
    }

    public Page<TrustOnboardingSubmissionListItem> getTrustOnboardingSubmissions(Pageable pageable) {
        List<TrustOnboardingSubmissionListItem> allOnboardingSubmissions = Objects.requireNonNull(
            this.trustOnboardingSubmissionApi.getTrustOnboardings(
                    null,
                    pageable.getPage(),
                    pageable.getSize(),
                    pageable.getSort()
                ).getContent()
        )
            .stream()
            .toList();
        return new PageImpl<>(allOnboardingSubmissions);
    }

    public TrustOnboardingSubmissionDto getTrustOnboardingSubmission(UUID id) {
        return toTrustOnboardingSubmissionDto(this.trustOnboardingSubmissionApi.getTrustOnboardingSubmission(id));
    }

    public TrustOnboardingSubmissionDto updateTrustOnboardingSubmission(UUID id, TrustOnboardingSubmissionRequest dto) {
        businessPartnerValidator.validateBusinessPartnerTypeOnboardingIsAllowed(dto.getRequestedPartnerType());
        return toTrustOnboardingSubmissionDto(
            this.trustOnboardingSubmissionApi.updateTrustOnboardingSubmission(id, dto)
        );
    }

    public void submitOnboardingSubmission(UUID id, TrustOnboardingSubmitRequest request) {
        this.trustOnboardingSubmissionApi.submit(id, request);
    }

    public Page<TrustOnboardingSubmissionDocumentListItem> listAllDocumentsForTrustOnboarding(
        UUID onboardingSubmissionId,
        Pageable pageable
    ) {
        List<TrustOnboardingSubmissionDocumentListItem> allDocuments = Objects.requireNonNull(
            this.trustOnboardingSubmissionApi.listAllDocumentsForTrustOnboarding(
                    onboardingSubmissionId,
                    pageable.getPage(),
                    pageable.getSize(),
                    pageable.getSort()
                ).getContent()
        )
            .stream()
            .toList();
        return new PageImpl<>(allDocuments);
    }

    public TrustOnboardingSubmissionDocument getDocument(UUID trustOnboardingSubmissionId, UUID documentId) {
        return this.trustOnboardingSubmissionApi.getDocumentForTrustOnboarding(trustOnboardingSubmissionId, documentId);
    }

    public TrustOnboardingSubmissionDocumentListItem uploadTrustOnboardingSubmissionDocument(
        UUID trustOnboardingSubmissionId,
        MultipartFile file
    ) {
        return this.trustOnboardingSubmissionApi.uploadTrustOnboardingSubmissionDocument(
                trustOnboardingSubmissionId,
                TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_DECLARATION_OF_INTENT,
                new MultipartFileResource(file)
            );
    }

    public TrustOnboardingSubmissionDocumentListItem uploadTrustOnboardingSubmissionOtherDocument(
        UUID trustOnboardingSubmissionId,
        MultipartFile file
    ) {
        // Additional ("other") documents may only be uploaded by BUSINESS partners that are not registered in the
        // commercial register (i.e. have no UID) or by GOVERNMENTAL_INSTITUTION partners. This mirrors the frontend's
        // showAdditionalDocuments condition and guards the endpoint against direct calls from other partner types.
        var submission = this.trustOnboardingSubmissionApi.getTrustOnboardingSubmission(trustOnboardingSubmissionId);
        var partnerType = submission.getBusinessPartnerType();
        var isUnregisteredBusiness =
            partnerType == BusinessPartnerType.BUSINESS &&
            Boolean.FALSE.equals(submission.getIsRegisteredInCommercialRegister());
        var isGovernmentalInstitution = partnerType == BusinessPartnerType.GOVERNMENTAL_INSTITUTION;
        if (!isUnregisteredBusiness && !isGovernmentalInstitution) {
            throw new DataInvalidException(
                "Additional documents may only be uploaded for BUSINESS partners that are not registered in the commercial register, or for GOVERNMENTAL_INSTITUTION partners.",
                BusinessErrorCode.DATA_INVALID
            );
        }
        return this.trustOnboardingSubmissionApi.uploadTrustOnboardingSubmissionDocument(
                trustOnboardingSubmissionId,
                TrustOnboardingSubmissionDocumentType.TRUST_ONBOARDING_OTHER,
                new MultipartFileResource(file)
            );
    }

    public void deleteDocument(UUID trustOnboardingSubmissionId, UUID documentId) {
        this.trustOnboardingSubmissionApi.deleteTrustOnboardingSubmissionDocument(
                trustOnboardingSubmissionId,
                documentId
            );
    }

    public TrustOnboardingSubmissionDto getLatestTrustOnboardingSubmission(
        LatestTrustOnboardingSubmissionRequestDto filter
    ) {
        var latestTrustOnboardingListItems =
            this.trustOnboardingSubmissionApi.getTrustOnboardings(
                    List.of(filter.businessPartnerId()),
                    0,
                    1,
                    List.of("updatedAt,desc")
                ).getContent();
        if (latestTrustOnboardingListItems != null) {
            var latestTrustOnboardingListItem = latestTrustOnboardingListItems.stream().findFirst().orElse(null);
            if (latestTrustOnboardingListItem != null) {
                return getTrustOnboardingSubmission(latestTrustOnboardingListItem.getId());
            }
        }
        throw new OpenApiResourceNotFoundException("No open trust onboarding submission identified.");
    }

    public ResponseEntity<Resource> getDeclarationOfIntent(UUID trustOnboardingSubmissionId, Language language) {
        var upstreamResponse =
            trustOnboardingSubmissionApi.getDeclarationOfIntentDocumentForTrustOnboardingWithHttpInfo(
                trustOnboardingSubmissionId,
                language
            );

        var response = ResponseEntity.status(upstreamResponse.getStatusCode());
        var contentType = upstreamResponse.getHeaders().getContentType();
        if (contentType != null) {
            response.contentType(contentType);
        }
        var contentDisposition = upstreamResponse.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        if (contentDisposition != null && !contentDisposition.isBlank()) {
            response.header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition);
        }
        return response.body(upstreamResponse.getBody());
    }
}
