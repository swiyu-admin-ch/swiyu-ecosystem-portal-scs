package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.admin.bit.jeap.security.test.WithJeapAuthenticationToken;
import ch.admin.bj.swiyu.app.api.AddressDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerUpdateRequestDto;
import ch.admin.bj.swiyu.app.api.ContactDto;
import ch.admin.bj.swiyu.app.api.LanguageDto;
import ch.admin.bj.swiyu.app.api.PartnerCreationRequestDto;
import ch.admin.bj.swiyu.app.common.config.FunctionalityProperties;
import ch.admin.bj.swiyu.app.exceptions.BusinessPartnerTypeNotAllowedException;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerV2Api;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartner;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

@ActiveProfiles("test")
@SpringBootTest(
    properties = {
        "app.functionality.automatic-approval-enabled=true",
        "app.functionality.payment-enabled=false",
        "app.functionality.allow-partner-base-onboarding-business-enabled=true",
        "app.functionality.allow-partner-base-onboarding-individual-enabled=true",
        "app.functionality.allow-partner-base-onboarding-governmental-enabled=true",
        "app.functionality.primary-environment-enabled=true",
    }
)
@WithJeapAuthenticationToken
class BusinessPartnerControllerTest {

    @MockitoBean
    BusinessPartnerV2Api businessPartnerV2Api;

    @MockitoSpyBean
    private FunctionalityProperties functionalityProperties;

    @Autowired
    private BusinessPartnerController businessPartnerController;

    private PartnerCreationRequestDto createRequest(BusinessPartnerType type) {
        return new PartnerCreationRequestDto(
            "CHE-123.456.789",
            "Test Organization",
            new AddressDto("Test Street 1", "Bern", "3000", "CH", "BE"),
            ContactDto.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@example.com")
                .phone("+41 31 123 45 67")
                .correspondingLanguage(LanguageDto.DE)
                .build(),
            type
        );
    }

    @Test
    void registerBusinessPartner_withBusinessType_whenEnabled_succeeds() {
        // GIVEN
        BusinessPartner testObject = new BusinessPartner();
        testObject.setId(UUID.randomUUID());
        testObject.type(BusinessPartnerType.BUSINESS);
        testObject.payedForDIDSlots(1);
        when(businessPartnerV2Api.createBusinessPartner(any())).thenReturn(testObject);
        when(functionalityProperties.allowPartnerBaseOnboardingBusinessEnabled()).thenReturn(true);

        // WHEN
        var result = businessPartnerController.registerBusinessPartner(createRequest(BusinessPartnerType.BUSINESS));

        // THEN
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testObject.getId());
    }

    @Test
    void registerBusinessPartner_withBusinessType_whenDisabled_throwsBadRequest() {
        when(functionalityProperties.allowPartnerBaseOnboardingBusinessEnabled()).thenReturn(false);
        var request = createRequest(BusinessPartnerType.BUSINESS);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(BusinessPartnerTypeNotAllowedException.class)
            .hasMessageContaining("BUSINESS")
            .hasMessageContaining("not allowed");
    }

    @Test
    void registerBusinessPartner_withIndividualType_whenDisabled_throwsBadRequest() {
        when(functionalityProperties.allowPartnerBaseOnboardingIndividualEnabled()).thenReturn(false);
        var request = createRequest(BusinessPartnerType.INDIVIDUAL);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(BusinessPartnerTypeNotAllowedException.class)
            .hasMessageContaining("INDIVIDUAL");
    }

    @Test
    void registerBusinessPartner_withGovernmentalType_whenDisabled_throwsBadRequest() {
        when(functionalityProperties.allowPartnerBaseOnboardingGovernmentalEnabled()).thenReturn(false);
        var request = createRequest(BusinessPartnerType.GOVERNMENTAL_INSTITUTION);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(BusinessPartnerTypeNotAllowedException.class)
            .hasMessageContaining("GOVERNMENTAL_INSTITUTION");
    }

    @Test
    void registerBusinessPartner_withUnknownType_alwaysThrowsBadRequest() {
        var request = createRequest(BusinessPartnerType.UNKNOWN);

        assertThatThrownBy(() -> businessPartnerController.registerBusinessPartner(request))
            .isInstanceOf(BusinessPartnerTypeNotAllowedException.class)
            .hasMessageContaining("UNKNOWN");
    }

    @Test
    @WithJeapAuthenticationToken(bpRoles = { "39f92e48-619e-4e92-8958-468ae138d8a3 = ti_@businesspartner_#write" })
    void updateBusinessPartner_delegatesPartialPayloadToService() {
        // GIVEN — partial payload: only the contact tile is edited
        var contactOnly = new BusinessPartnerUpdateRequestDto(
            null,
            null,
            null,
            ContactDto.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .phone("+41 31 123 45 67")
                .correspondingLanguage(LanguageDto.DE)
                .build()
        );

        BusinessPartner testObject = new BusinessPartner();
        var id = UUID.fromString("39f92e48-619e-4e92-8958-468ae138d8a3");
        testObject.setId(id);
        testObject.type(BusinessPartnerType.BUSINESS);
        testObject.payedForDIDSlots(1);
        when(businessPartnerV2Api.updateBusinessPartner(any(), any())).thenReturn(testObject);

        // WHEN
        var result = businessPartnerController.updateBusinessPartner(id, contactOnly);

        // THEN
        assertThat(result.id()).isEqualTo(id);
        verify(businessPartnerV2Api).updateBusinessPartner(any(), any());
    }
}
