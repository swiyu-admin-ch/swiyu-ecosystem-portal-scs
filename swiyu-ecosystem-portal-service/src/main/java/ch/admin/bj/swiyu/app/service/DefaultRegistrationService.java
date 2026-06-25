package ch.admin.bj.swiyu.app.service;

import static ch.admin.bj.swiyu.app.service.BusinessEntityMapper.toCreateBusinessEntity;
import static ch.admin.bj.swiyu.app.service.BusinessEntityMapper.toUpdateBusinessEntity;

import ch.admin.bj.swiyu.app.api.PageDto;
import ch.admin.bj.swiyu.app.api.RegistrationRequestDto;
import ch.admin.bj.swiyu.app.api.RegistrationResponseDto;
import ch.admin.bj.swiyu.app.api.UpdateRequestDto;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerApi;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Profile("!mock-registration-service")
public class DefaultRegistrationService implements RegistrationService {

    private final BusinessPartnerApi managementBusinessApi;

    @Override
    public RegistrationResponseDto register(RegistrationRequestDto request) {
        var businessEntity = this.managementBusinessApi.createBusinessEntity(toCreateBusinessEntity(request));
        return BusinessEntityMapper.toRegistrationResponseDto(businessEntity);
    }

    @Override
    public RegistrationResponseDto updateOrganisation(String id, UpdateRequestDto request) {
        var businessEntity =
            this.managementBusinessApi.updateBusinessEntity(UUID.fromString(id), toUpdateBusinessEntity(request));
        return BusinessEntityMapper.toRegistrationResponseDto(businessEntity);
    }

    @Override
    public PageDto<RegistrationResponseDto> getRegistrations(Pageable pageable) {
        var pageBusinessEntity =
            this.managementBusinessApi.getBusinessEntities(pageable.getPage(), pageable.getSize(), pageable.getSort());
        return BusinessEntityMapper.toPageRegistrationResponseDto(pageBusinessEntity);
    }

    @Override
    public RegistrationResponseDto getRegistration(String id) {
        var businessPartner = this.managementBusinessApi.getBusinessPartner2(UUID.fromString(id));
        return BusinessEntityMapper.toRegistrationResponseDto(businessPartner);
    }
}
