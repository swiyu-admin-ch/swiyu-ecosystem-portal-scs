import {ValidatorFn} from '@angular/forms';

export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'datetime' | 'readonly' | 'array';
  canCopy?: boolean;
  /** Validators applied to this field's form control in edit mode */
  validators?: ValidatorFn[];
  /** When provided, renders a <mat-select> in edit mode instead of <input> */
  selectOptions?: {value: string; labelKey: string}[];
  /** When true, this field is hidden during the ACTIVE identity edit (re-verification) flow */
  hideInActiveEdit?: boolean;
  /**
   * Map of validator error key → i18n translation key shown in <mat-error>.
   * e.g. { required: 'eportal_onboarding_profile_error_inputLabel_name',
   *         blank:    'eportal_onboarding_profile_error_inputLabel_name' }
   */
  errors?: Partial<Record<string, string>>;
}

export interface SectionLink {
  label: string; // Translation key for link text
  url: string; // Translation key for URL (will be translated to get actual URL)
}
