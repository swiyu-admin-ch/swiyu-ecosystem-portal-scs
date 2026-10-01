package ch.admin.bj.swiyu.app.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Map;
import java.util.regex.Pattern;

public class LocalizedMapValidator implements ConstraintValidator<ValidLocalizedMap, Map<String, String>> {

    private static final Pattern LOCALE_PATTERN = Pattern.compile(LocalizedMapValidation.BCP_47_LOCALE_PATTERN);

    @Override
    public boolean isValid(Map<String, String> value, ConstraintValidatorContext context) {
        // A missing map is @NotNull's business, not this constraint's.
        if (value == null) {
            return true;
        }

        if (!value.containsKey(LocalizedMapValidation.DEFAULT_VALUE_KEY)) {
            return false;
        }

        return value
            .keySet()
            .stream()
            .filter(key -> !LocalizedMapValidation.DEFAULT_VALUE_KEY.equals(key))
            .allMatch(key -> LOCALE_PATTERN.matcher(key).matches());
    }
}
