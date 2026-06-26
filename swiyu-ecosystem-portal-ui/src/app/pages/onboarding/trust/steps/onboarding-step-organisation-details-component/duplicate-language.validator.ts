import {AbstractControl, FormArray, ValidationErrors, ValidatorFn} from '@angular/forms';
import {EntityNameEntryFormGroup} from './onboarding-step-organisation-details.component';

export const DUPLICATE_LANGUAGE_ERROR = 'duplicateLanguage';

export function duplicateLanguageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray<EntityNameEntryFormGroup>;
    formArray.controls.forEach((entry, index) => {
      const ctrl = entry.controls.language;
      if (!ctrl.value) {
        return;
      }

      const isDuplicate = formArray.controls.findIndex(e => e.controls.language.value === ctrl.value) !== index;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {[DUPLICATE_LANGUAGE_ERROR]: _, ...errors} = ctrl.errors || {};
      if (isDuplicate) {
        errors[DUPLICATE_LANGUAGE_ERROR] = true;
      }

      ctrl.setErrors(Object.keys(errors).length ? errors : null, {
        emitEvent: false
      });
    });

    const hasDuplicate = formArray.controls.some(entry => entry.controls.language.hasError(DUPLICATE_LANGUAGE_ERROR));

    return hasDuplicate ? {duplicateLanguages: true} : null;
  };
}
