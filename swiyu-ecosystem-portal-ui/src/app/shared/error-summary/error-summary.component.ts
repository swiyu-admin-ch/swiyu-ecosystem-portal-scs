import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, inject, Input, ViewChild} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {FormErrors} from './error-summary-configuration.helper';

/**
 * Accessible error summary (a11y) that lists the validation errors of a form.
 *
 * Expects errors already prepared by `getFormErrors` and renders one link per entry (label path and
 * translated message). Activating a link focuses the corresponding form element (or the id given by
 * `FormErrors.link`) instead of navigating. `focus()` lets the owner move the focus to the summary
 * itself, e.g. after a failed submit.
 */
@Component({
  selector: 'app-error-summary',
  imports: [TranslatePipe],
  templateUrl: './error-summary.component.html'
})
export class ErrorSummaryComponent {
  @Input() errors: FormErrors[] = [];
  @Input() ignoredLabels: string[] = [];
  @Input() titleKey = 'eportal_global_errors';
  @Input() titleId = 'error-summary-title';

  private readonly document = inject<Document>(DOCUMENT);

  @ViewChild('errorSummary') private readonly errorSummary?: ElementRef<HTMLElement>;

  focus(): void {
    this.errorSummary?.nativeElement.focus();
  }

  focusElement = (path: string): void => {
    const element = this.document.getElementById(path);

    if (!element) {
      return;
    }

    const focusTarget = element.matches('input, select, textarea, button, a, [tabindex]:not([tabindex="-1"])')
      ? element
      : element.querySelector<HTMLElement>('input, select, textarea, button, a, [tabindex]:not([tabindex="-1"])');

    (focusTarget ?? element).focus();
  };

  handleClick(error: FormErrors, event: MouseEvent): void {
    const pathOverride = error.link ? error.link : error.path;
    this.focusElement(pathOverride);
    event.preventDefault();
  }
}
