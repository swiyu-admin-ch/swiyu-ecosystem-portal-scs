package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.LatestTrustOnboardingSubmissionRequestDto;
import ch.admin.bj.swiyu.app.api.TrustOnboardingSubmissionDto;
import ch.admin.bj.swiyu.app.service.TrustOnboardingSubmissionService;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionListItem;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionRequest;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmitRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trust-onboarding-submission")
@Tag(name = "Trust Onboarding", description = "Trust Onboarding API")
@AllArgsConstructor
public class TrustOnboardingController {

    private TrustOnboardingSubmissionService trustOnboardingSubmissionService;

    @PreAuthorize("hasRoleForPartner('trustonboardingsubmission','write', #submission.getPartnerId())")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new trust onboarding submission")
    public TrustOnboardingSubmissionDto createTrustOnboardingSubmission(
        @RequestBody TrustOnboardingSubmissionRequest submission
    ) {
        return trustOnboardingSubmissionService.createTrustOnboardingSubmission(submission);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','read')") // partner-ids are checked in core-business
    @PostAuthorize(
        "@authSupport.hasRoleForPartners('trustonboardingsubmission', 'read', returnObject.getContent().![partnerId])"
    )
    @GetMapping
    @Operation(summary = "Get all trust onboarding submissions of partner")
    @PageableAsQueryParam
    public PagedModel<TrustOnboardingSubmissionListItem> getAllTrustOnboardingSubmissions(
        @SortDefault(sort = "submittedAt", direction = Sort.Direction.DESC) @Parameter(
            hidden = true
        ) final Pageable pageable
    ) {
        return new PagedModel<>(this.trustOnboardingSubmissionService.getTrustOnboardingSubmissions(pageable));
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','read')")
    @PostAuthorize("hasRoleForPartner('trustonboardingsubmission','read', returnObject.partnerId())")
    @GetMapping("/{id}")
    @Operation(summary = "Get a trust onboarding submission by id")
    public TrustOnboardingSubmissionDto getTrustOnboardingSubmission(@PathVariable UUID id) {
        return trustOnboardingSubmissionService.getTrustOnboardingSubmission(id);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','read')")
    @PostAuthorize(
        "returnObject == null || hasRoleForPartner('trustonboardingsubmission','read', returnObject.partnerId())"
    )
    @PostMapping("/latest")
    @Operation(summary = "Get the latest trust onboarding submission")
    public TrustOnboardingSubmissionDto getLatestTrustOnboardingSubmission(
        @NotNull @Valid @RequestBody LatestTrustOnboardingSubmissionRequestDto filter
    ) {
        return trustOnboardingSubmissionService.getLatestTrustOnboardingSubmission(filter);
    }

    @PreAuthorize("hasRoleForPartner('trustonboardingsubmission','write', #request.getPartnerId())")
    @PutMapping("/{id}")
    @Operation(summary = "Update a trust onboarding submission")
    public TrustOnboardingSubmissionDto updateTrustOnboardingSubmission(
        @PathVariable UUID id,
        @RequestBody TrustOnboardingSubmissionRequest request
    ) {
        return trustOnboardingSubmissionService.updateTrustOnboardingSubmission(id, request);
    }

    @PreAuthorize("hasRole('trustonboardingsubmission','write')") // partner-ids are checked in core-business
    @PostMapping("/{id}/submit")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Submit a trust onboarding submission")
    public void submitTrustOnboardingSubmission(
        @PathVariable UUID id,
        @RequestBody TrustOnboardingSubmitRequest request
    ) {
        trustOnboardingSubmissionService.submitOnboardingSubmission(id, request);
    }
}
