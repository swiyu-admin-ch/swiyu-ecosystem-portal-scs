package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.PageDto;
import ch.admin.bj.swiyu.app.api.RegistrationRequestDto;
import ch.admin.bj.swiyu.app.api.RegistrationResponseDto;
import ch.admin.bj.swiyu.app.api.UpdateRequestDto;
import org.springdoc.core.converters.models.Pageable;

public interface RegistrationService {
    RegistrationResponseDto register(RegistrationRequestDto registrationRequestDto);

    RegistrationResponseDto updateOrganisation(String id, UpdateRequestDto updateRequestDto);

    PageDto<RegistrationResponseDto> getRegistrations(Pageable pageable);

    RegistrationResponseDto getRegistration(String id);
}
