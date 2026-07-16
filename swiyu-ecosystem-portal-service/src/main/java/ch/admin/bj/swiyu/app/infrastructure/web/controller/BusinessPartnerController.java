package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.BusinessPartnerDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerListItemDto;
import ch.admin.bj.swiyu.app.api.PartnerCreationRequestDto;
import ch.admin.bj.swiyu.app.service.BusinessPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-partner")
@Tag(name = "BusinessPartner", description = "BusinessPartner API")
@AllArgsConstructor
public class BusinessPartnerController {

    private final BusinessPartnerService businessPartnerService;

    @PreAuthorize("isAuthenticated()") // any user that is logged in can register an organization
    @Operation(summary = "IF-013.006 - Register BusinessPartner")
    @PostMapping("/")
    public BusinessPartnerDto registerBusinessPartner(
        @RequestBody PartnerCreationRequestDto partnerCreationRequestDto
    ) {
        return this.businessPartnerService.register(partnerCreationRequestDto);
    }

    @PreAuthorize("hasRole('businesspartner','read')") // check for partner is done in core-business
    @Operation(summary = "IF-013.004 - Get list of BusinessPartners")
    @GetMapping("/")
    @PageableAsQueryParam
    public PagedModel<BusinessPartnerListItemDto> getBusinessPartners(
        @SortDefault(sort = "updatedAt", direction = Sort.Direction.DESC) @Parameter(
            hidden = true
        ) final Pageable pageable
    ) {
        return this.businessPartnerService.getBusinessPartners(pageable);
    }

    @PreAuthorize("hasRoleForPartner('businesspartner','read',#businessPartnerId)")
    @Operation(summary = "IF-013.005 - Get BusinessPartner")
    @GetMapping("/{businessPartnerId}")
    public BusinessPartnerDto getBusinessPartner(@PathVariable UUID businessPartnerId) {
        return this.businessPartnerService.getBusinessPartner(businessPartnerId);
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Checks if user has any registered BusinessPartners")
    @GetMapping("/exists")
    public boolean hasBusinessPartners() {
        try {
            return !this.businessPartnerService.getBusinessPartners(Pageable.ofSize(1)).getContent().isEmpty();
        } catch (Exception e) {
            // New users without any business partners don't have the required role yet,
            // so they'll get an authorization error. This is expected - treat it as "no partners".
            // Tech debt - implement a proper check in the core-business-service that doesn't require the role --> EID-5741
            return false;
        }
    }
}
