package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.service.TrustOnboardingSubmissionService;
import ch.admin.bj.swiyu.client.business.internal.model.Language;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionDocument;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionDocumentListItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/trust-onboarding-submission")
@Tag(name = "Trust Onboarding Documents", description = "Trust Onboarding Documents API")
@AllArgsConstructor
@ConditionalOnProperty(
    prefix = "features",
    name = "EIDARTFE_1122",
    havingValue = "true",
    matchIfMissing = false // disabled by default
)
public class TrustOnboardingSubmissionDocumentController {

    private TrustOnboardingSubmissionService trustOnboardingSubmissionService;

    @PreAuthorize("hasRole('trustonboardingsubmission','read')") // partner id is checked in core-business
    @GetMapping("/{id}/documents")
    @Operation(summary = "Get all documents of a trust onboarding submission")
    @PageableAsQueryParam
    public Page<TrustOnboardingSubmissionDocumentListItem> listAllDocumentsForTrustOnboarding(
        @PathVariable UUID id,
        @SortDefault(sort = "createdAt", direction = Sort.Direction.DESC) @Parameter(
            hidden = true
        ) final Pageable pageable
    ) {
        return trustOnboardingSubmissionService.listAllDocumentsForTrustOnboarding(id, pageable);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','read')") // partner id is checked in core-business
    @GetMapping("/{id}/documents/{documentId}")
    @Operation(summary = "Get specific document for TrustOnboardingSubmission by ID")
    public TrustOnboardingSubmissionDocument getDocumentForTrustOnboarding(
        @PathVariable @Valid UUID id,
        @PathVariable @Valid UUID documentId
    ) {
        return trustOnboardingSubmissionService.getDocument(id, documentId);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','write')") // partner id is checked in core-business
    @PostMapping(path = "/{id}/documents/declaration-of-intent", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document")
    public TrustOnboardingSubmissionDocumentListItem uploadTrustOnboardingSubmissionDocument(
        @PathVariable @Valid UUID id,
        @RequestPart("file") @Valid MultipartFile file // <-- This was changed from File to MultipartFile
    ) {
        return trustOnboardingSubmissionService.uploadTrustOnboardingSubmissionDocument(id, file);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','write')") // partner id is checked in core-business
    @PostMapping(path = "/{id}/documents/other", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an additional document")
    public TrustOnboardingSubmissionDocumentListItem uploadTrustOnboardingSubmissionOtherDocument(
        @PathVariable @Valid UUID id,
        @RequestPart("file") @Valid MultipartFile file
    ) {
        return trustOnboardingSubmissionService.uploadTrustOnboardingSubmissionOtherDocument(id, file);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','read')") // partner id is checked in core-business
    @GetMapping(path = "/{id}/documents/declaration-of-intent")
    @Operation(summary = "Get filled declaration of intent")
    public ResponseEntity<Resource> getDeclarationOfIntentForTrustOnboarding(
        @PathVariable @Valid UUID id,
        @RequestParam("language") Language language
    ) {
        return trustOnboardingSubmissionService.getDeclarationOfIntent(id, language);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','write')") // partner id is checked in core-business
    @DeleteMapping("/{id}/documents/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a document for TrustOnboardingSubmission")
    public void deleteTrustOnboardingSubmissionDocument(
        @PathVariable @Valid UUID id,
        @PathVariable @Valid UUID documentId
    ) {
        trustOnboardingSubmissionService.deleteDocument(id, documentId);
    }
}
