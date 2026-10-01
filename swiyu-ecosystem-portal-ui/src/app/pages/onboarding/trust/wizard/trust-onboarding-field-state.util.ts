import {AbstractControl} from '@angular/forms';
import {TrustFieldConfig} from './trust-onboarding-flow.config';

/**
 * Applies a flow's field configuration to the backing form control.
 *
 * Hidden and read-only fields are disabled: a disabled control is neither editable nor part of the
 * form's validity, so a flow that hides a required field does not end up with an unsubmittable form.
 */
export function applyFieldState(control: AbstractControl, state: TrustFieldConfig): void {
  if (state.visible && state.editable) {
    control.enable({emitEvent: false});
  } else {
    control.disable({emitEvent: false});
  }
  control.updateValueAndValidity({emitEvent: false});
}
