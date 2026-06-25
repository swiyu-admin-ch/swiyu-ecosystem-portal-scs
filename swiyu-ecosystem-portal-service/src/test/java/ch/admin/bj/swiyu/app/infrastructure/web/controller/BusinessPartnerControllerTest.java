package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import ch.admin.bj.swiyu.app.api.BusinessPartnerDto;
import ch.admin.bj.swiyu.app.api.PartnerCreationRequestDto;
import ch.admin.bj.swiyu.app.infrastructure.web.config.FunctionalityProperties;
import ch.admin.bj.swiyu.app.service.BusinessPartnerService;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class BusinessPartnerControllerTest {

    @Mock
    private BusinessPartnerService businessPartnerService;

    @Mock
    private FunctionalityProperties functionalityProperties;

    private BusinessPartnerController businessPartnerController;

    @BeforeEach
    void setUp() {
        businessPartnerController = new BusinessPartnerController(businessPartnerService, functionalityProperties);
    }

    @Test
    void registerBusinessPartner_withBusinessType_whenEnabled_succeeds() {
        when(functionalityProperties.allowPartnerBaseOnboardingBusinessEnabled()).thenReturn(true);
        when(businessPartnerService.register(any())).thenReturn(mock(BusinessPartnerDto.class));

        businessPartnerController.registerBusinessPartner(createRequest(BusinessPartnerType.BUSINESS));

        verify(businessPartnerService).register(any());
    }

    @Test
    void registerBusinessPartner_withBusinessType_whenDisabled_throwsBadRequest() {
        when(functionalityProperties.allowPartnerBaseOnboardingBusinessEnabled()).thenReturn(false);
        var request = createRequest(BusinessPartnerType.BUSINESS);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("BUSINESS")
            .hasMessageContaining("not allowed");

        verifyNoInteractions(businessPartnerService);
    }

    @Test
    void registerBusinessPartner_withIndividualType_whenDisabled_throwsBadRequest() {
        when(functionalityProperties.allowPartnerBaseOnboardingIndividualEnabled()).thenReturn(false);
        var request = createRequest(BusinessPartnerType.INDIVIDUAL);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("INDIVIDUAL");

        verifyNoInteractions(businessPartnerService);
    }

    @Test
    void registerBusinessPartner_withGovernmentalType_whenDisabled_throwsBadRequest() {
        when(functionalityProperties.allowPartnerBaseOnboardingGovernmentalEnabled()).thenReturn(false);
        var request = createRequest(BusinessPartnerType.GOVERNMENTAL_INSTITUTION);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("GOVERNMENTAL_INSTITUTION");

        verifyNoInteractions(businessPartnerService);
    }

    @Test
    void registerBusinessPartner_withUnknownType_alwaysThrowsBadRequest() {
        var request = createRequest(BusinessPartnerType.UNKNOWN);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("UNKNOWN");

        verifyNoInteractions(businessPartnerService);
    }

    private PartnerCreationRequestDto createRequest(BusinessPartnerType type) {
        return new PartnerCreationRequestDto(
            "CHE-123.456.789",
            "Test Organization",
            "Test Street 1",
            "3000",
            "Bern",
            "CH",
            "BE",
            "+41 31 123 45 67",
            "test@example.com",
            type
        );
    }
}
