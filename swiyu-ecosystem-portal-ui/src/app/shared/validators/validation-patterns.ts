/**
 * Pattern Breakdown:
 * ^(?:\+41|0041)   -> Matches prefix +41 or 0041
 * \s?              -> Optional space
 * [1-9]\d     -> 2-digit provider code
 * \s?\d{3}         -> Optional space and 3 digits
 * (?:\s?\d{2}){2}  -> Group of (space + 2 digits) repeated twice
 * $                -> End of string
 */
export const SWISS_PHONE_PATTERN = /^(?:\+41|0041)\s?[1-9]\d\s?\d{3}(?:\s?\d{2}){2}$/;

/**
 * Normalized Swiss phone number:
 * +41 followed by exactly 9 digits.
 *
 * Valid:
 * +41791234567
 *
 * Invalid:
 * +410791234567
 */
export const SWISS_PHONE_PATTERN_E164_STYLE = /^\+41[1-9]\d{8}$/;

/**
 * Normalized international phone number:
 * + followed by 7 to 15 digits.
 *
 * This is a rudimentary E.164-style check.
 * It does not validate country-specific rules.
 */
export const INTERNATIONAL_PHONE_PATTERN_E164_STYLE = /^\+[1-9]\d{6,14}$/;
/**
 * Pattern Breakdown:
 * ^CHE             -> Must start with the prefix 'CHE'
 * (?:              -> Start non-capturing group for the numeric part
 * -?\d{3}\.      -> Optional hyphen, 3 digits, and a dot
 * \d{3}\.        -> 3 digits and a dot
 * \d{3}          -> The final 3 digits
 * |              -> OR (alternation)
 * \d{9}          -> Exactly 9 digits without any separators
 * )                -> End non-capturing group
 * $                -> End of string
 */
export const SWISS_UID_PATTERN = /^CHE(?:-?\d{3}\.\d{3}\.\d{3}|\d{9})$/;
