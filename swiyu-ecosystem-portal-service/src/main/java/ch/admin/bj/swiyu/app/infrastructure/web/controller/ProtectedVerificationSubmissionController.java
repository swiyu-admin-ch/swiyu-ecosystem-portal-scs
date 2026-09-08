package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.ProtectedVerificationSubmissionDto;
import ch.admin.bj.swiyu.app.api.ProtectedVerificationSubmissionRequestDto;
import ch.admin.bj.swiyu.app.service.ProtectedVerificationSubmissionService;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationCategory;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionListItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/protected-verification-submissions")
@Tag(name = "Protected Verification Submission", description = "Protected Verification Submission API")
@AllArgsConstructor
@ConditionalOnProperty(prefix = "features", name = "EIDARTFE_1822_PROTECTED_VERIFICATION", havingValue = "true")
public class ProtectedVerificationSubmissionController {

    private ProtectedVerificationSubmissionService protectedVerificationSubmissionService;

    @PreAuthorize("hasRoleForPartner('protectedverificationsubmission','write', #submission.partnerId())")
    @PostMapping
    @Operation(summary = "Create a new protected verification submission")
    public ProtectedVerificationSubmissionDto createProtectedVerificationSubmission(
        @Valid @RequestBody ProtectedVerificationSubmissionRequestDto submission
    ) {
        return protectedVerificationSubmissionService.createProtectedVerificationSubmission(submission);
    }

    @PreAuthorize("hasRole('protectedverificationsubmission','read')")
    @GetMapping("/categories")
    @Operation(summary = "Get all available protected verification categories")
    public List<ProtectedVerificationCategory> getProtectedVerificationCategories() {
        return protectedVerificationSubmissionService.getProtectedVerificationCategories();
    }

    @PreAuthorize("hasRole('protectedverificationsubmission','read')") // partner-ids are checked in core-business
    @PostAuthorize(
        "@authSupport.hasRoleForPartners('protectedverificationsubmission', 'read', returnObject.getContent().![partnerId])"
    )
    @GetMapping
    @Operation(summary = "Get all protected verification submissions, optionally filtered by partner")
    @PageableAsQueryParam
    public PagedModel<ProtectedVerificationSubmissionListItem> getAllProtectedVerificationSubmissions(
        @RequestParam(required = false) UUID businessPartnerId,
        @SortDefault(sort = "submittedAt", direction = Sort.Direction.DESC) @Parameter(
            hidden = true
        ) final Pageable pageable
    ) {
        return new PagedModel<>(
            this.protectedVerificationSubmissionService.getProtectedVerificationSubmissions(businessPartnerId, pageable)
        );
    }

    @PreAuthorize("hasRoleForPartner('protectedverificationsubmission','read', #businessPartnerId)")
    @GetMapping("/latest")
    @Operation(summary = "Get the latest protected verification submission for a partner")
    public ProtectedVerificationSubmissionDto getLatestProtectedVerificationSubmission(
        @RequestParam UUID businessPartnerId
    ) {
        return protectedVerificationSubmissionService.getLatestProtectedVerificationSubmission(businessPartnerId);
    }

    @PreAuthorize("hasRole('protectedverificationsubmission','read')")
    @PostAuthorize("hasRoleForPartner('protectedverificationsubmission','read', returnObject.partnerId())")
    @GetMapping("/{id}")
    @Operation(summary = "Get a protected verification submission by id")
    public ProtectedVerificationSubmissionDto getProtectedVerificationSubmission(@PathVariable UUID id) {
        return protectedVerificationSubmissionService.getProtectedVerificationSubmission(id);
    }
}
