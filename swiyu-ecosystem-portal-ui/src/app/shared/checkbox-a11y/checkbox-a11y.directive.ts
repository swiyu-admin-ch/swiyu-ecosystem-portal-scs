import {AfterViewInit, Directive, ElementRef, Input, OnChanges, inject} from '@angular/core';

/**
 * Accessibility directive for mat-checkbox with validation errors.
 *
 * Angular Material's mat-checkbox does not expose aria-invalid or aria-describedby
 * as inputs that forward to the inner <input type="checkbox"> element. This directive
 * queries that inner input directly and sets both attributes when the checkbox is invalid,
 * linking it to an external error message element via its id. Both attributes are removed
 * when the checkbox becomes valid again.
 *
 * Usage:
 *   <mat-checkbox appCheckboxA11y [appCheckboxInvalid]="ctrl.invalid && ctrl.touched" appCheckboxDescribedBy="my-error-id">
 *   <mat-error id="my-error-id">Error message</mat-error>
 */
@Directive({
  selector: 'mat-checkbox[appCheckboxA11y]',
  standalone: true
})
export class CheckboxA11yDirective implements AfterViewInit, OnChanges {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() appCheckboxInvalid = false;
  @Input() appCheckboxDescribedBy: string | null = null;

  private inputEl: HTMLInputElement | null = null;

  ngAfterViewInit(): void {
    this.inputEl = this.el.nativeElement.querySelector('input[type="checkbox"]');
    this.apply();
  }

  ngOnChanges(): void {
    this.apply();
  }

  private apply(): void {
    if (!this.inputEl) {
      return;
    }
    if (this.appCheckboxInvalid) {
      this.inputEl.setAttribute('aria-invalid', 'true');
      if (this.appCheckboxDescribedBy) {
        this.inputEl.setAttribute('aria-describedby', this.appCheckboxDescribedBy);
      }
    } else {
      this.inputEl.removeAttribute('aria-invalid');
      this.inputEl.removeAttribute('aria-describedby');
    }
  }
}
