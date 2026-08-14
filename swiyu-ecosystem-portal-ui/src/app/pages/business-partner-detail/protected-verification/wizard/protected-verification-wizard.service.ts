import {inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  ProtectedVerificationSubmission,
  ProtectedVerificationSubmissionApi
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AbstractOnboardingStepComponent} from '../../../onboarding/trust/steps/abstract-onboarding-step-component';

export const PROTECTED_VERIFICATION_STEP_SEGMENTS = ['category', 'confirmation'];
export const PROTECTED_VERIFICATION_STEP_MAP = Object.fromEntries(
  PROTECTED_VERIFICATION_STEP_SEGMENTS.map((s, i) => [s, i])
);

export interface ProtectedVerificationFormValue {
  category?: ProtectedVerificationSubmission.CategoryEnum;
  sbnId?: string;
  reason?: string;
}

@Injectable()
export class ProtectedVerificationWizardService {
  private readonly protectedVerificationSubmissionApi = inject(ProtectedVerificationSubmissionApi);
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly router = inject(Router);

  partnerId: string | null = null;
  formValue: ProtectedVerificationFormValue = {};

  readonly businessPartner = signal<BusinessPartner | undefined>(undefined);
  readonly categories = signal<ProtectedVerificationSubmission.CategoryEnum[]>([]);
  readonly submission = signal<ProtectedVerificationSubmission | undefined>(undefined);
  readonly currentStepIndex = signal(0);

  private activeStep: AbstractOnboardingStepComponent | null = null;

  init(partnerId: string): void {
    this.partnerId = partnerId;

    forkJoin({
      businessPartner: this.businessPartnerApi.getBusinessPartner({businessPartnerId: partnerId}),
      categories: this.protectedVerificationSubmissionApi.getProtectedVerificationCategories()
    }).subscribe(({businessPartner, categories}) => {
      this.businessPartner.set(businessPartner);
      this.categories.set(categories as ProtectedVerificationSubmission.CategoryEnum[]);
    });
  }

  setActiveStep(step: AbstractOnboardingStepComponent | null): void {
    this.activeStep = step;
  }

  updateFormValue(value: ProtectedVerificationFormValue): void {
    this.formValue = {...this.formValue, ...value};
  }

  submitAndNext(): void {
    this.validateStepIsValid().then(isValid => {
      if (!isValid || !this.partnerId) {
        return;
      }
      this.protectedVerificationSubmissionApi
        .createProtectedVerificationSubmission({
          protectedVerificationSubmissionRequest: {
            partnerId: this.partnerId,
            sbnId: this.formValue.sbnId!,
            entityName: this.businessPartner()?.entityName?.['default'] ?? '',
            uid: this.businessPartner()?.uid,
            category: this.formValue.category!,
            reason: this.formValue.reason!
          }
        })
        .subscribe(submission => {
          this.submission.set(submission);
          this.navigateToNextStep();
        });
    });
  }

  navigateToOverview(): void {
    if (!this.partnerId) {
      return;
    }
    this.router.navigate(AppRoutes.protectedVerificationOverview(this.partnerId));
  }

  private navigateToNextStep(): void {
    if (!this.partnerId) {
      return;
    }
    const nextSegment = PROTECTED_VERIFICATION_STEP_SEGMENTS[this.currentStepIndex() + 1];
    if (nextSegment) {
      this.router.navigate([...AppRoutes.protectedVerificationWizard(this.partnerId), nextSegment]);
    }
  }

  private async validateStepIsValid(): Promise<boolean> {
    if (!this.activeStep) {
      return false;
    }
    return this.activeStep.validate();
  }
}
