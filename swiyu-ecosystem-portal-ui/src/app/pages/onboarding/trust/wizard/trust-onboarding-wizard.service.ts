import {inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin, Subject} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  TrustOnboardingApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionRequest
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {AbstractOnboardingStepComponent} from '../steps/abstract-onboarding-step-component';

export const TRUST_STEP_SEGMENTS = ['profile', 'dids', 'formal-proof', 'technical-proof', 'approval'];
export const TRUST_STEP_MAP = Object.fromEntries(TRUST_STEP_SEGMENTS.map((s, i) => [s, i]));

@Injectable()
export class TrustOnboardingWizardService {
  private readonly trustOnboardingApi = inject(TrustOnboardingApi);
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly router = inject(Router);
  readonly appConfigService = inject(AppConfigService);

  partnerId: string | null = null;
  submissionId: string | null = null;
  isIntentionalNavigation = false;

  readonly submission = signal<TrustOnboardingSubmission | undefined>(undefined);
  readonly businessPartner = signal<BusinessPartner | null>(null);
  readonly requestedBusinessPartnerType = signal<BusinessPartner.TypeEnum | undefined>(undefined);
  submissionRequest: TrustOnboardingSubmissionRequest = {};
  initialSubmissionRequest: TrustOnboardingSubmissionRequest = {};

  private activeStep: AbstractOnboardingStepComponent | null = null;
  readonly currentStepIndex = signal(0);
  private readonly submissionUpdatedSubject = new Subject<void>();
  readonly submissionUpdated$ = this.submissionUpdatedSubject.asObservable();

  init(partnerId: string, submissionId: string): void {
    this.partnerId = partnerId;
    this.submissionId = submissionId;

    forkJoin({
      businessPartner: this.businessPartnerApi.getBusinessPartner({businessPartnerId: partnerId}),
      submission: this.trustOnboardingApi.getTrustOnboardingSubmission({id: submissionId})
    }).subscribe({
      next: ({businessPartner, submission}) => {
        // Set business partner
        this.businessPartner.set(businessPartner);

        // Set submission
        this.submission.set(submission);
        this.submissionRequest = this.mapToSubmissionRequest(submission);
        this.initialSubmissionRequest = {...this.submissionRequest};

        // if the submission was newly created the existing actor type from the base registry should be used.
        // Once the user selected the actor type it becomes the requestedPartnerType which will be taken over,
        // when the submissions has been accepted by bj
        if (
          !submission.businessPartnerType ||
          submission.businessPartnerType === TrustOnboardingSubmission.BusinessPartnerTypeEnum.Unknown
        ) {
          this.requestedBusinessPartnerType.set(businessPartner.type);
        } else {
          this.requestedBusinessPartnerType.set(submission.businessPartnerType);
        }
      }
    });
  }

  setActiveStep(step: AbstractOnboardingStepComponent | null): void {
    this.activeStep = step;
  }

  saveAndNext(): void {
    this.validateStepIsValid().then(isValid => {
      if (isValid && this.submissionRequest && this.submissionId) {
        this.trustOnboardingApi
          .updateTrustOnboardingSubmission({
            id: this.submissionId,
            trustOnboardingSubmissionRequest: this.submissionRequest
          })
          .subscribe({
            next: (submission: TrustOnboardingSubmission) => {
              this.submission.set(submission);
              this.requestedBusinessPartnerType.set(submission.businessPartnerType);
              this.initialSubmissionRequest = {...this.submissionRequest};
              this.submissionUpdatedSubject.next();
              this.navigateToNextStep();
            }
          });
      }
    });
  }

  submit(): void {
    this.validateStepIsValid().then(isValid => {
      if (isValid) {
        this.initialSubmissionRequest = {...this.submissionRequest};
        this.navigateToNextStep();
      }
    });
  }

  onSaveAndContinueLater(): void {
    if (!this.activeStep || !this.submissionId || !this.submissionRequest) {
      return;
    }

    if (this.activeStep.isValid()) {
      this.trustOnboardingApi
        .updateTrustOnboardingSubmission({
          id: this.submissionId,
          trustOnboardingSubmissionRequest: this.submissionRequest
        })
        .subscribe({
          next: (result: TrustOnboardingSubmission) => {
            this.submission.set(result);
            this.submissionUpdatedSubject.next();
            this.isIntentionalNavigation = true;
            this.router.navigate(AppRoutes.businessPartnerOverviewV2());
          }
        });
    } else {
      this.router.navigate(AppRoutes.businessPartnerOverviewV2());
    }
  }

  navigateToPreviousStep(): void {
    if (!this.partnerId || !this.submissionId) {
      return;
    }
    if (this.currentStepIndex() > 0) {
      const prevSegment = TRUST_STEP_SEGMENTS[this.currentStepIndex() - 1];
      this.router.navigate([...AppRoutes.trustOnboardingWizard(this.partnerId, this.submissionId), prevSegment]);
    }
  }

  updateOrganisationData(value: TrustOnboardingSubmissionRequest): void {
    this.submissionRequest = {...value, dids: this.submissionRequest.dids};
  }

  updateDidSelection(value: string[]): void {
    this.submissionRequest = {...this.submissionRequest, dids: value};
  }

  private navigateToNextStep(): void {
    if (!this.partnerId || !this.submissionId) {
      return;
    }
    if (this.currentStepIndex() < TRUST_STEP_SEGMENTS.length - 1) {
      const nextSegment = TRUST_STEP_SEGMENTS[this.currentStepIndex() + 1];
      this.router.navigate([...AppRoutes.trustOnboardingWizard(this.partnerId, this.submissionId), nextSegment]);
    }
  }

  private async validateStepIsValid(): Promise<boolean> {
    if (!this.activeStep) {
      return false;
    }
    return this.activeStep.validate();
  }

  private mapToSubmissionRequest(result: TrustOnboardingSubmission): TrustOnboardingSubmissionRequest {
    return {
      partnerId: result.partnerId,
      entityName: result.entityName,
      entityAddress: result.entityAddress,
      entityEmail: result.entityEmail,
      contactPerson: result.contactPerson,
      signingRule: result.signingRule,
      signatories: result.signatories,
      registryIds: result.registryIds,
      correspondingLanguage: result.correspondingLanguage,
      dids: result.proofOfPossessionList.map(pop => pop.did ?? '') || [],
      requestedPartnerType: result.businessPartnerType,
      isRegisteredInCommercialRegister: result.isRegisteredInCommercialRegister
    };
  }
}
