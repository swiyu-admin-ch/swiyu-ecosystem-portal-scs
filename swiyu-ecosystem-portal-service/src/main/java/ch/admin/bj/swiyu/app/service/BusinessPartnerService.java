package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.BusinessPartnerDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerListItemDto;
import ch.admin.bj.swiyu.app.api.PartnerCreationRequestDto;
import ch.admin.bj.swiyu.app.domain.BusinessPartnerValidator;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerV2Api;
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
                    .map(BusinessPartnerMapper::toBusinessPartnerListItemDto)
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
        return BusinessPartnerMapper.toBusinessPartnerDto(businessPartner);
    }

    public BusinessPartnerDto register(PartnerCreationRequestDto partnerCreationRequestDto) {
        businessPartnerValidator.validateBusinessPartnerTypeOnboardingIsAllowed(
            partnerCreationRequestDto.businessPartnerType()
        );
        var createPartner = BusinessPartnerMapper.toCreatePartner(partnerCreationRequestDto);
        var businessPartner = this.businessPartnerV2Api.createBusinessPartner(createPartner);
        return BusinessPartnerMapper.toBusinessPartnerDto(businessPartner);
    }
}
