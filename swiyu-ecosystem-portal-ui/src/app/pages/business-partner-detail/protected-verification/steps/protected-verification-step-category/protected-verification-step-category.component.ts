import {Component, effect, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule, ObErrorMessagesModule} from '@oblique/oblique';
import {ProtectedVerificationSubmission} from '../../../../../api/generated';
import {InfoIconComponent} from '../../../../../shared/info-icon/info-icon.component';
import {AbstractOnboardingStepComponent} from '../../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {ProtectedVerificationWizardService} from '../../wizard/protected-verification-wizard.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-protected-verification-step-category',
  templateUrl: './protected-verification-step-category.component.html',
  styleUrls: [
    '../../../../onboarding/trust/steps/onboarding-steps.scss',
    './protected-verification-step-category.component.scss'
  ],
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: ProtectedVerificationStepCategoryComponent}],
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    ObButtonModule,
    MatButtonModule,
    ObErrorMessagesModule,
    InfoIconComponent
  ]
})
export class ProtectedVerificationStepCategoryComponent extends AbstractOnboardingStepComponent {
  protected readonly wizardService = inject(ProtectedVerificationWizardService);
  protected readonly maxLengthReason = 2000;
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    category: this.fb.control<ProtectedVerificationSubmission.CategoryEnum | undefined>(undefined, [
      Validators.required
    ]),
    sbnId: this.fb.control<string | undefined>(undefined, [Validators.required, Validators.pattern(UUID_PATTERN)]),
    reason: this.fb.control<string | undefined>(undefined, [
      Validators.required,
      Validators.maxLength(this.maxLengthReason)
    ])
  });

  constructor() {
    super();
    // validate() is the single point where the form value is pushed into the wizard
    // service (right before submission), so no continuous sync is needed here.
    effect(() => {
      const [firstCategory] = this.wizardService.categories();
      if (firstCategory && !this.form.controls.category.value) {
        this.form.controls.category.setValue(firstCategory);
      }
    });
  }

  override async validate(): Promise<boolean> {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return false;
    }
    this.wizardService.updateFormValue({
      category: this.form.controls.category.value ?? undefined,
      sbnId: this.form.controls.sbnId.value ?? undefined,
      reason: this.form.controls.reason.value ?? undefined
    });
    return true;
  }

  override isValid(): boolean {
    return this.form.valid;
  }

  next(): void {
    this.wizardService.submitAndNext();
  }

  cancel(): void {
    this.wizardService.navigateToOverview();
  }
}
