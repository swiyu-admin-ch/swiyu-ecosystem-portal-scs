package ch.admin.bj.swiyu.app.common.validation;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The portal rejects a localized map the CBS would reject, so that a malformed entityName fails
 * here with a field-level violation rather than as an opaque 400 from the CBS.
 */
class LocalizedMapValidatorTest {

    private static final String DEFAULT_KEY = LocalizedMapValidation.DEFAULT_VALUE_KEY;
    private static final String VALUE = "Tourismusverband";

    private final LocalizedMapValidator validator = new LocalizedMapValidator();

    @Test
    void nullMap_isValid() {
        // Presence is @NotNull's concern, not this constraint's.
        assertThat(validator.isValid(null, null)).isTrue();
    }

    @Test
    void emptyMap_isInvalid() {
        assertThat(validator.isValid(Map.of(), null)).isFalse();
    }

    @Test
    void defaultOnly_isValid() {
        assertThat(validator.isValid(Map.of(DEFAULT_KEY, VALUE), null)).isTrue();
    }

    @Test
    void mapWithoutDefault_isInvalid() {
        assertThat(validator.isValid(Map.of("de-CH", VALUE), null)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = { "de", "de-CH", "rm-CH", "zh-Hans", "zh-Hans-CN", "es-419" })
    void acceptedLocaleKeys(String localeKey) {
        assertThat(validator.isValid(Map.of(DEFAULT_KEY, VALUE, localeKey, VALUE), null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = { "DE_CH", "deutsch", "de-", "d", "de-CHE", "" })
    void rejectedLocaleKeys(String localeKey) {
        assertThat(validator.isValid(Map.of(DEFAULT_KEY, VALUE, localeKey, VALUE), null)).isFalse();
    }
}
