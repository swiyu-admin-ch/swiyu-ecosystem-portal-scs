package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.BusinessPartnerDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerListItemDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerUpdateRequestDto;
import ch.admin.bj.swiyu.app.api.PartnerCreationRequestDto;
import ch.admin.bj.swiyu.app.domain.BusinessPartnerValidator;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerV2Api;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BusinessPartnerService {

    private final BusinessPartnerV2Api businessPartnerV2Api;
    private final BusinessPartnerValidator businessPartnerValidator;

    public PagedModel<BusinessPartnerListItemDto> getBusinessPartners(Pageable pageable) {
        var sortParams = pageable
            .getSort()
            .stream()
            .map(order -> order.getProperty() + "," + order.getDirection().name().toLowerCase())
            .toList();
        var businessPartners = businessPartnerV2Api.getBusinessPartners(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            sortParams
        );

        return new PagedModel<>(
            new PageImpl<>(
                businessPartners
                    .getContent()
                    .stream()
                    .map(item ->
                        BusinessPartnerMapper.toBusinessPartnerListItemDto(
                            item,
                            verificationProgressMaxDate(item.getId())
                        )
                    )
                    .toList(),
                PageRequest.of(
                    Math.toIntExact(businessPartners.getPage().getNumber()),
                    Math.toIntExact(businessPartners.getPage().getSize())
                ),
                businessPartners.getPage().getTotalElements()
            )
        );
    }

    public BusinessPartnerDto getBusinessPartner(UUID businessPartnerId) {
        var businessPartner = businessPartnerV2Api.getBusinessPartner(businessPartnerId);
        return BusinessPartnerMapper.toBusinessPartnerDto(
            businessPartner,
            verificationProgressMaxDate(businessPartnerId)
        );
    }

    private Instant verificationProgressMaxDate(UUID businessPartnerId) {
        var progress = businessPartnerV2Api.getVerificationProgress(businessPartnerId);
        return progress == null ? null : progress.getMaxDateForStatus();
    }

    /**
     * Returns the canonical verification deadline ({@code maxDateForStatus}) reported by the centralized
     * verification-progress endpoint for the given business partner, or {@code null} when the current
     * verification state has no deadline. This is the single source of truth for any UI deadline (chip,
     * alerts, resubmission countdown) so that all consumers agree.
     */
    public Instant getVerificationProgressMaxDate(UUID businessPartnerId) {
        return verificationProgressMaxDate(businessPartnerId);
    }

    public BusinessPartnerDto register(PartnerCreationRequestDto partnerCreationRequestDto) {
        businessPartnerValidator.validateBusinessPartnerTypeOnboardingIsAllowed(
            partnerCreationRequestDto.businessPartnerType()
        );
        var createPartner = BusinessPartnerMapper.toCreatePartner(partnerCreationRequestDto);
        var businessPartner = this.businessPartnerV2Api.createBusinessPartner(createPartner);
        return BusinessPartnerMapper.toBusinessPartnerDto(businessPartner);
    }

    public BusinessPartnerDto updateBusinessPartner(
        UUID businessPartnerId,
        BusinessPartnerUpdateRequestDto updateRequestDto
    ) {
        var update = BusinessPartnerMapper.toBusinessPartnerUpdate(updateRequestDto);
        var businessPartner = businessPartnerV2Api.updateBusinessPartner(businessPartnerId, update);
        return BusinessPartnerMapper.toBusinessPartnerDto(businessPartner);
    }
}
