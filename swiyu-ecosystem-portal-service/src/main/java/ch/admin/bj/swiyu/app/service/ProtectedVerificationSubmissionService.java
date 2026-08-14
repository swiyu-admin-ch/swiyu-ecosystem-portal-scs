package ch.admin.bj.swiyu.app.service;

import static ch.admin.bj.swiyu.app.service.ProtectedVerificationSubmissionMapper.toProtectedVerificationSubmissionDto;

import ch.admin.bj.swiyu.app.api.ProtectedVerificationSubmissionDto;
import ch.admin.bj.swiyu.client.business.internal.api.ProtectedVerificationSubmissionApi;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationCategory;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionListItem;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionRequest;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class ProtectedVerificationSubmissionService {

    private final ProtectedVerificationSubmissionApi protectedVerificationSubmissionApi;

    public ProtectedVerificationSubmissionDto createProtectedVerificationSubmission(
        ProtectedVerificationSubmissionRequest request
    ) {
        return toProtectedVerificationSubmissionDto(
            this.protectedVerificationSubmissionApi.createProtectedVerificationSubmission(request)
        );
    }

    public List<ProtectedVerificationCategory> getProtectedVerificationCategories() {
        return this.protectedVerificationSubmissionApi.getProtectedVerificationCategories();
    }

    public Page<ProtectedVerificationSubmissionListItem> getProtectedVerificationSubmissions(
        UUID businessPartnerId,
        Pageable pageable
    ) {
        List<ProtectedVerificationSubmissionListItem> allSubmissions = Objects.requireNonNull(
            this.protectedVerificationSubmissionApi.getProtectedVerificationSubmissions(
                    businessPartnerId != null ? List.of(businessPartnerId) : null,
                    pageable.getPage(),
                    pageable.getSize(),
                    pageable.getSort()
                ).getContent()
        )
            .stream()
            .toList();
        return new PageImpl<>(allSubmissions);
    }

    public ProtectedVerificationSubmissionDto getProtectedVerificationSubmission(UUID id) {
        return toProtectedVerificationSubmissionDto(
            this.protectedVerificationSubmissionApi.getProtectedVerificationSubmission(id)
        );
    }

    public ProtectedVerificationSubmissionDto getLatestProtectedVerificationSubmission(UUID businessPartnerId) {
        var latestListItems =
            this.protectedVerificationSubmissionApi.getProtectedVerificationSubmissions(
                    List.of(businessPartnerId),
                    0,
                    1,
                    List.of("updatedAt,desc")
                ).getContent();
        if (latestListItems != null) {
            var latest = latestListItems.stream().findFirst().orElse(null);
            if (latest != null) {
                return getProtectedVerificationSubmission(latest.getId());
            }
        }
        throw new OpenApiResourceNotFoundException("No protected verification submission identified.");
    }
}
