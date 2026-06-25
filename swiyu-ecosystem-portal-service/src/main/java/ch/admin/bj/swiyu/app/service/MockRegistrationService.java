package ch.admin.bj.swiyu.app.service;

import ch.admin.bj.swiyu.app.api.PageDto;
import ch.admin.bj.swiyu.app.api.RegistrationRequestDto;
import ch.admin.bj.swiyu.app.api.RegistrationResponseDto;
import ch.admin.bj.swiyu.app.api.UpdateRequestDto;
import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.app.exceptions.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.IntStream;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("mock-registration-service")
public class MockRegistrationService implements RegistrationService {

    private final List<RegistrationResponseDto> mockData = new ArrayList<>();

    public MockRegistrationService() {
        initMockData();
    }

    @Override
    public RegistrationResponseDto register(RegistrationRequestDto registrationRequestDto) {
        var registrationResponse = new RegistrationResponseDto(
            UUID.randomUUID().toString(),
            registrationRequestDto.organizationName(),
            registrationRequestDto.technicalEmailAddress()
        );
        this.mockData.add(registrationResponse);
        return registrationResponse;
    }

    @Override
    public RegistrationResponseDto updateOrganisation(String id, UpdateRequestDto updateRequestDto) {
        RegistrationResponseDto updatedRegistration = null;
        for (var i = 0; i < mockData.size(); i++) {
            RegistrationResponseDto registration = mockData.get(i);
            if (registration.id().compareTo(id) == 0) {
                updatedRegistration = new RegistrationResponseDto(
                    id,
                    updateRequestDto.organizationName(),
                    updateRequestDto.technicalEmailAddress()
                );
                // Replace the old registration with the updated one because java records are immutable
                mockData.set(i, updatedRegistration);
                break;
            }
        }
        return updatedRegistration;
    }

    @Override
    public PageDto<RegistrationResponseDto> getRegistrations(Pageable pageable) {
        int start = pageable.getPage() * pageable.getSize();
        int end = Math.min(start + pageable.getSize(), mockData.size());
        var content = mockData.subList(start, end);

        return new PageDto<>(
            content,
            (long) Math.ceil((double) mockData.size() / pageable.getSize()),
            mockData.size(),
            pageable.getSize(),
            pageable.getPage()
        );
    }

    @Override
    public RegistrationResponseDto getRegistration(String id) {
        var businessPartner = mockData.stream().filter(partner -> Objects.equals(partner.id(), id)).findFirst();
        if (businessPartner.isEmpty()) {
            throw new EntityNotFoundException(
                String.format("BusinessPartner with id '%s' not found.", id),
                BusinessErrorCode.RESOURCE_NOT_FOUND
            );
        }
        return businessPartner.get();
    }

    private void initMockData() {
        mockData.addAll(
            IntStream.range(0, 12)
                .mapToObj(i ->
                    new RegistrationResponseDto(UUID.randomUUID().toString(), "Org" + i, "email" + i + "@example.com")
                )
                .toList()
        );
    }
}
