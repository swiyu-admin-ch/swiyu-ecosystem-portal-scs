package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.IdentifierResponseDto;
import ch.admin.bj.swiyu.app.api.IdentifierStatusDto;
import ch.admin.bj.swiyu.app.api.IdentifierUpdateRequestDto;
import ch.admin.bj.swiyu.client.business.internal.api.IdentifierApi;
import ch.admin.bj.swiyu.client.business.internal.model.IdentifierEntry;
import ch.admin.bj.swiyu.client.business.internal.model.IdentifierUpdateRequest;
import ch.admin.bj.swiyu.client.business.internal.model.PagedModelIdentifierEntry;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class IdentifierService {

    private final IdentifierApi api;

    private static Page<IdentifierResponseDto> toPage(PagedModelIdentifierEntry result) {
        if (result == null || result.getContent() == null) {
            return Page.empty();
        }
        var meta = result.getPage();
        var request = PageRequest.of(meta.getNumber().intValue(), meta.getSize().intValue());
        var content = result.getContent().stream().map(IdentifierService::toIdentifierResponseDto).toList();
        return new PageImpl<>(content, request, meta.getTotalElements());
    }

    public static IdentifierResponseDto toIdentifierResponseDto(IdentifierEntry identifierEntry) {
        return new IdentifierResponseDto(
            identifierEntry.getDid(),
            identifierEntry.getId(),
            identifierEntry.getDescription(),
            toIdentifierStatusDto(identifierEntry.getStatus())
        );
    }

    private static IdentifierStatusDto toIdentifierStatusDto(IdentifierEntry.StatusEnum status) {
        return switch (status) {
            case NOT_INITIALIZED -> IdentifierStatusDto.NOT_INITIALIZED;
            case INITIALIZED -> IdentifierStatusDto.INITIALIZED;
            case USER_DEACTIVATED -> IdentifierStatusDto.USER_DEACTIVATED;
            case DEACTIVATED_BY_MIGRATION_BECAUSE_OF_UNSUPPORTED_FORMAT -> IdentifierStatusDto.DEACTIVATED_BY_MIGRATION_BECAUSE_OF_UNSUPPORTED_FORMAT;
        };
    }

    public Page<IdentifierResponseDto> getIdentifiersOfOrganisation(UUID organisationId, Pageable pageable) {
        var pagedResult =
            this.api.getAllIdentifierEntries(
                    organisationId,
                    pageable.getPage(),
                    pageable.getSize(),
                    pageable.getSort()
                );
        return toPage(pagedResult);
    }

    public IdentifierResponseDto getIdentifierOfPartner(UUID partnerId, UUID identifierId) {
        var identifier = this.api.getIdentifierEntry(partnerId, identifierId);
        return toIdentifierResponseDto(identifier);
    }

    public void updateIdentifierDescription(
        UUID partnerId,
        UUID identifierId,
        IdentifierUpdateRequestDto identifierUpdateRequestDto
    ) {
        var identifierUpdateRequest = new IdentifierUpdateRequest();
        identifierUpdateRequest.description(identifierUpdateRequestDto.description());
        this.api.updateIdentifierDescription(partnerId, identifierId, identifierUpdateRequest);
    }
}
