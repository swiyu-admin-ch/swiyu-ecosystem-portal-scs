import {AbstractControl, FormArray, FormGroup, ValidationErrors} from '@angular/forms';

/**
 * A single validation error of a form control, prepared for rendering in the `ErrorSummaryComponent`.
 */
export interface FormErrors {
  /** Path of the invalid control: `FormGroup` names joined with `.`, `FormArray` entries suffixed with `[index]`. */
  path: string;
  /** Angular validation errors of the control, as reported by the form. */
  errors: ValidationErrors;
  /** Translated labels describing the control's position in the form; empty when the label is ignored. */
  pathFragments: string[];
  /** Translation key of the message to display for this control. */
  errorTranslationKey: string;
  /** Label suffixes for which the path label is suppressed (matched with `endsWith`). */
  ignored: string[];
  /** Optional DOM id to focus instead of `path` when the summary entry is activated. */
  link?: string;
}

/**
 * Recursively collects the validation errors of a control and all of its descendants and prepares
 * them for the `ErrorSummaryComponent`.
 *
 * Returns one entry per control that has errors, parents before children. Paths use dot notation for
 * `FormGroup` children (`address.street`) and an index suffix for `FormArray` entries (`dids[0]`) so
 * that they can also be used as DOM ids. Entries whose last label fragment ends with one of
 * `labelIgnoredPath` get an empty `pathFragments`, which hides the field label in the summary.
 *
 * @param control control (usually a `FormGroup`) whose subtree is inspected
 * @param getTranslationKey maps a form control name to its translation key
 * @param labelIgnoredPath label suffixes for which no path label is displayed
 * @param getErrorTranslationKey optional mapper from the control's last label fragment and the error
 *   key to a translation key; defaults to `<lastLabelFragment>_error_<errorKey>`
 * @param getLink optional mapper from the control path to the DOM id that should be focused instead
 *   of the path itself
 * @param path path prefix, used internally during recursion
 * @param pathFragments collected label fragments, used internally during recursion
 * @returns the prepared errors of the subtree, parents before children
 */
export function getFormErrors(
  control: AbstractControl,
  getTranslationKey: (path: string) => string,
  labelIgnoredPath: string[] = [],
  getErrorTranslationKey?: (path: string, error: string) => string,
  getLink?: (path: string) => string,
  path = '',
  pathFragments: string[] = []
): FormErrors[] {
  const result: FormErrors[] = [];

  if (control.errors) {
    const error = Object.keys(control.errors)[0];
    const lastPathFragment = pathFragments[pathFragments.length - 1];

    result.push({
      path,
      errors: control.errors,
      pathFragments: [...pathFragments],
      errorTranslationKey: getErrorTranslationKey
        ? getErrorTranslationKey(lastPathFragment, error)
        : `${lastPathFragment}_error_${error}`,
      ignored: labelIgnoredPath,
      link: getLink ? getLink(path) : undefined
    });
  }

  if (control instanceof FormGroup) {
    Object.entries(control.controls).forEach(([name, child]) => {
      result.push(
        ...getFormErrors(
          child,
          getTranslationKey,
          labelIgnoredPath,
          getErrorTranslationKey,
          getLink,
          path !== '' ? `${path}.${name}` : name,
          [...pathFragments, getTranslationKey(name)]
        )
      );
    });
  }

  if (control instanceof FormArray) {
    control.controls.forEach((child, index) => {
      result.push(
        ...getFormErrors(
          child,
          getTranslationKey,
          labelIgnoredPath,
          getErrorTranslationKey,
          getLink,
          `${path}[${index}]`,
          [`${getTranslationKey(path)}[${index}]`]
        )
      );
    });
  }

  // clean up ignored labels
  return result.map(res => {
    // Check if it should be ignored
    const lastFragment = res.pathFragments[res.pathFragments.length - 1];

    if (lastFragment && res.ignored.some(ign => lastFragment.endsWith(ign))) {
      // Return a new object with the cleared pathFragments
      return {
        ...res,
        pathFragments: []
      };
    }

    return {...res};
  });
}
