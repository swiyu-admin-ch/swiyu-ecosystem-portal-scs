import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {
  INTERNATIONAL_PHONE_PATTERN_E164_STYLE,
  SWISS_PHONE_PATTERN,
  SWISS_PHONE_PATTERN_E164_STYLE,
  SWISS_UID_PATTERN
} from './validation-patterns';

export class CustomValidators {
  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (typeof value !== 'string') {
        return null;
      }

      return value.trim().length > 0 ? null : {blank: true};
    };
  }

  static emptyOrNotBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      if (typeof value !== 'string') {
        return null;
      }

      return value.trim().length > 0 ? null : {blank: true};
    };
  }

  static swissZipCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      return /^[1-9]\d{3}$/.test(value) ? null : {swissZipCode: true};
    };
  }

  static swissUid(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      return SWISS_UID_PATTERN.test(value) ? null : {swissUid: true};
    };
  }

  static normalizePhoneNumber(value: string): string {
    return value
      .trim()
      .replaceAll(/[\s().-]/g, '')
      .replace(/^00/, '+');
  }

  static internationalPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const normalizedValue = this.normalizePhoneNumber(String(value));

      if (normalizedValue.startsWith('+41')) {
        return SWISS_PHONE_PATTERN_E164_STYLE.test(normalizedValue)
          ? null
          : {
              swissPhoneNumber: {
                normalizedValue,
                expectedFormat: '+41 xx xxx xx xx'
              }
            };
      }

      return INTERNATIONAL_PHONE_PATTERN_E164_STYLE.test(normalizedValue)
        ? null
        : {
            internationalPhoneNumber: {
              normalizedValue,
              expectedFormat: '+<country-code><number>'
            }
          };
    };
  }

  static swissPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const normalizedValue = this.normalizePhoneNumber(String(value));

      return SWISS_PHONE_PATTERN.test(normalizedValue)
        ? null
        : {
            swissPhoneNumber: {
              normalizedValue,
              expectedFormat: '+41 xx xxx xx xx'
            }
          };
    };
  }
}
