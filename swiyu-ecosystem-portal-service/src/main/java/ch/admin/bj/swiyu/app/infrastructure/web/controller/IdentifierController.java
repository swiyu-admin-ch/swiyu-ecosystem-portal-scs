package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.IdentifierResponseDto;
import ch.admin.bj.swiyu.app.api.IdentifierUpdateRequestDto;
import ch.admin.bj.swiyu.app.service.IdentifierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Identifier", description = "Identifier API")
@AllArgsConstructor
public class IdentifierController {

    private IdentifierService identifierService;

    @PreAuthorize("hasRoleForPartner('identifier','read', #partnerId)")
    @GetMapping("/{partnerId}/identifiers")
    @Operation(summary = "Get all identifier entries of partner")
    @PageableAsQueryParam
    public PagedModel<IdentifierResponseDto> getAllIdentifiersOfPartner(
        @PathVariable UUID partnerId,
        @SortDefault(sort = "submittedAt", direction = Sort.Direction.DESC) @Parameter(
            hidden = true
        ) final Pageable pageable
    ) {
        return new PagedModel<>(this.identifierService.getIdentifiersOfOrganisation(partnerId, pageable));
    }

    @PreAuthorize("hasRoleForPartner('identifier','read', #partnerId)")
    @GetMapping("/{partnerId}/identifier/{identifierId}")
    @Operation(summary = "Get a specific identifier entry of partner")
    public IdentifierResponseDto getIdentifierOfPartner(@PathVariable UUID partnerId, @PathVariable UUID identifierId) {
        return this.identifierService.getIdentifierOfPartner(partnerId, identifierId);
    }

    @PreAuthorize("hasRoleForPartner('identifier','write', #partnerId)")
    @PostMapping("/{partnerId}/identifier/{identifierId}/description")
    @Operation(summary = "Update description of a specific identifier entry of partner")
    public void updateIdentifierDescription(
        @PathVariable UUID partnerId,
        @PathVariable UUID identifierId,
        @Valid @RequestBody IdentifierUpdateRequestDto identifierUpdateRequestDto
    ) {
        this.identifierService.updateIdentifierDescription(partnerId, identifierId, identifierUpdateRequestDto);
    }
}
