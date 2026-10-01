package ch.admin.bj.swiyu.app.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = LocalizedMapValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidLocalizedMap {
    String message() default "must contain a \"default\" entry and BCP 47 locale keys";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
