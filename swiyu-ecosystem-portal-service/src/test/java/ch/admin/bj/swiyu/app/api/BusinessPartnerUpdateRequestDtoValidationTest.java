package ch.admin.bj.swiyu.app.api;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Verifies that the portal validates an update request the same way the CBS does:
 * nested {@code address} and {@code contact} are validated ({@code @Valid}), while a
 * partial payload (only one tile present) is accepted.
 */
class BusinessPartnerUpdateRequestDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    private ContactDto validContact() {
        return ContactDto.builder()
            .firstName("John")
            .lastName("Doe")
            .email("john@example.com")
            .phone("+41 31 123 45 67")
            .correspondingLanguage(LanguageDto.DE)
            .build();
    }

    @Test
    void partialContactOnlyPayload_isValid() {
        var dto = new BusinessPartnerUpdateRequestDto(null, null, null, validContact());
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void contactWithBlankRequiredFields_isInvalid() {
        var invalidContact = ContactDto.builder()
            .firstName("")
            .lastName("Doe")
            .email("not-an-email")
            .phone("abc")
            .build();
        var dto = new BusinessPartnerUpdateRequestDto(null, null, null, invalidContact);

        var violations = validator.validate(dto);

        assertThat(violations)
            .extracting(v -> v.getPropertyPath().toString())
            .contains("contact.firstName", "contact.email", "contact.phone");
    }

    @Test
    void contactWithInvalidPhoneNumber_isInvalid() {
        var invalidPhone = ContactDto.builder()
            .firstName("John")
            .lastName("Doe")
            .email("john@example.com")
            .phone("123")
            .build();
        var dto = new BusinessPartnerUpdateRequestDto(null, null, null, invalidPhone);

        var violations = validator.validate(dto);

        assertThat(violations).extracting(v -> v.getPropertyPath().toString()).contains("contact.phone");
    }

    @Test
    void uid_isOptional() {
        // uid stays optional even when other profile fields are provided.
        var dto = new BusinessPartnerUpdateRequestDto("Test Org", null, null, validContact());
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void uidFormat_notValidatedOnPortal() {
        // The portal deliberately does not validate uid/name format — the CBS does.
        // This ensures partial payloads (e.g. address/contact only) are never blocked.
        var dto = new BusinessPartnerUpdateRequestDto(UUID.randomUUID().toString(), "not-a-uid", null, null);
        assertThat(validator.validate(dto)).isEmpty();
    }
}
