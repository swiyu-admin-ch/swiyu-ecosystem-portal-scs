package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.*;
import ch.admin.bj.swiyu.app.api.RegistrationResponseDto;
import ch.admin.bj.swiyu.app.api.UpdateRequestDto;
import ch.admin.bj.swiyu.client.business.internal.model.*;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessEntity;
import ch.admin.bj.swiyu.client.business.internal.model.CreateBusinessEntity;
import ch.admin.bj.swiyu.client.business.internal.model.PagedModelBusinessEntity;
import ch.admin.bj.swiyu.client.business.internal.model.UpdateBusinessEntity;
import java.util.*;
import lombok.experimental.*;

@UtilityClass
public class BusinessEntityMapper {

    public static RegistrationResponseDto toRegistrationResponseDto(BusinessEntity businessEntity) {
        return new RegistrationResponseDto(
            String.valueOf(businessEntity.getId()),
            businessEntity.getName(),
            businessEntity.getContactEmailAddress()
        );
    }

    public static PageDto<RegistrationResponseDto> toPageRegistrationResponseDto(
        PagedModelBusinessEntity pageBusinessEntity
    ) {
        List<RegistrationResponseDto> content = pageBusinessEntity
            .getContent()
            .stream()
            .map(BusinessEntityMapper::toRegistrationResponseDto)
            .toList();
        return new PageDto<>(
            content,
            pageBusinessEntity.getPage().getTotalPages(),
            pageBusinessEntity.getPage().getTotalElements(),
            pageBusinessEntity.getPage().getSize(),
            pageBusinessEntity.getPage().getNumber()
        );
    }

    public static CreateBusinessEntity toCreateBusinessEntity(RegistrationRequestDto request) {
        return new CreateBusinessEntity(
            request.organizationName(),
            request.technicalEmailAddress(),
            BusinessPartnerType.UNKNOWN
        );
    }

    public static UpdateBusinessEntity toUpdateBusinessEntity(UpdateRequestDto updateRequestDto) {
        return new UpdateBusinessEntity(updateRequestDto.organizationName(), updateRequestDto.technicalEmailAddress());
    }
}
