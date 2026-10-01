package ch.admin.bj.swiyu.app.common.validation;

import lombok.experimental.UtilityClass;

/**
 * The shape of a localized text map as the CBS defines it: a {@code default} entry plus any number
 * of BCP 47 keyed translations. Must be kept in sync with the CBS, which rejects anything else.
 */
@UtilityClass
public class LocalizedMapValidation {

    // The fallback entry, required in every localized map.
    public static final String DEFAULT_VALUE_KEY = "default";

    // BCP 47 language tag: language[-script][-region], e.g. de, de-CH, zh-Hans, zh-Hans-CN.
    public static final String BCP_47_LOCALE_PATTERN = "^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|\\d{3}))?$";
}
