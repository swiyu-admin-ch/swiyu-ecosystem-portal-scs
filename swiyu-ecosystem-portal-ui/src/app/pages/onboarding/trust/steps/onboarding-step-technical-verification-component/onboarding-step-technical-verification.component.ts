import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatChip} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ObAlertComponent, ObButtonDirective, ObSelectableGroupDirective} from '@oblique/oblique';
import {firstValueFrom} from 'rxjs';
import {TrustOnboardingApi} from '../../../../../api/generated';
import {AppRoutes} from '../../../../../app.routes';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {MailtoTemplateService} from '../../../../../shared/email/mailto-template.service';
import {ProcessStepComponent} from '../../../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../../../shared/process/process.component';
import {RadioCardComponent} from '../../../../../shared/radio-card/radio-card.component';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {AbstractOnboardingStepComponent} from '../abstract-onboarding-step-component';
import {SetupVariant} from './explainer-steps.types';

@Component({
  selector: 'app-onboarding-step-technical-verification',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatIcon,
    ObAlertComponent,
    FormsModule,
    ObButtonDirective,
    MatButton,
    MatChip,
    ProcessComponent,
    ProcessStepComponent,
    RouterLink,
    ObSelectableGroupDirective,
    RadioCardComponent
  ],
  templateUrl: 'onboarding-step-technical-verification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: OnboardingStepTechnicalVerificationComponent}],
  styleUrls: ['../onboarding-steps.scss', './onboarding-step-technical-verification.component.scss']
})
export class OnboardingStepTechnicalVerificationComponent extends AbstractOnboardingStepComponent {
  private readonly translateService = inject(TranslateService);
  protected readonly appConfig = inject(AppConfigService);
  private readonly trustOnboardingApi = inject(TrustOnboardingApi);
  protected readonly wizardService = inject(TrustOnboardingWizardService);
  private readonly fb = inject(FormBuilder);
  private readonly mailtoTemplateService = inject(MailtoTemplateService);
  readonly SetupVariant = SetupVariant;
  readonly setupForm = this.fb.group({
    setupVariant: this.fb.control<SetupVariant | null>(null, Validators.required)
  });
  variantStepCompleted = signal<boolean>(false);
  readonly mailtoLink = computed(() => {
    return this.mailtoTemplateService.buildHandoverMailtoLink({
      subjectKey: 'eportal_onboardingTR_development_emailTemplate_subject',
      bodyKey: 'eportal_onboardingTR_development_emailTemplate_body'
    });
  });

  showError = signal<boolean>(false);

  constructor() {
    super();
    this.translateSetup();
  }

  get eportalInviteLink() {
    return `${this.appConfig.eportalUrl}/manage-users/permissions/businessPartner/${this.wizardService.partnerId ?? ''}/userManagement`;
  }

  override isValid(): boolean {
    return this.setupForm.valid;
  }

  get anyVerificationMissing() {
    return this.numberOfMissingVerifications() > 0;
  }

  override async validate(): Promise<boolean> {
    const submission = this.wizardService.submission();
    const id = submission?.id;
    const version = submission?.version;

    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
    }

    if (this.setupForm.valid && !this.variantStepCompleted() && this.anyVerificationMissing) {
      this.variantStepCompleted.set(true);
      return false;
    }

    if ((this.variantStepCompleted() || !this.anyVerificationMissing) && id && version) {
      try {
        await firstValueFrom(
          this.trustOnboardingApi.submitTrustOnboardingSubmission({
            id: id,
            trustOnboardingSubmitRequest: {
              version: version
            }
          })
        );
        return true;
      } catch {
        this.showError.set(true);
        return false;
      }
    }

    return false;
  }

  protected selectSetupVariant(variant: SetupVariant): void {
    this.setupForm.patchValue({setupVariant: variant});
  }

  protected numberOfMissingVerifications = computed(() => {
    return (
      this.wizardService.submission()?.proofOfPossessionList?.filter(pop => pop.status === 'NOT_SUPPLIED').length ?? 0
    );
  });

  protected numberOfSuccessfulVerifications = computed(() => {
    return this.wizardService.submission()?.proofOfPossessionList?.filter(pop => pop.status === 'VALID').length ?? 0;
  });

  protected daysRemainingForVerification = computed(() => {
    return 42; //  only visual. currently there is no logic implemented regarding expiry of submission
  });

  protected copyPOPUrl() {
    const popUrl = this.appConfig.portalUrl;
    if (popUrl) {
      navigator.clipboard.writeText(popUrl);
    }
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_onboardingTR_technicalProof_sendInvite_cardTitle');
    this.translateService.get('eportal_onboardingTR_technicalProof_sendInvite_cardText');
    this.translateService.get('eportal_global_link_invitation');
    this.translateService.get('eportal_global_link_TechDocumentation');
    this.translateService.get('eportal_onboardingTR_technicalProof_handover_cardText');
    this.translateService.get('eportal_onboardingTR_technicalProof_handover_cardTitle');
    this.translateService.get('eportal_onboardingTR_technicalProof_complete_cardTitle');
    this.translateService.get('eportal_onboardingTR_technicalProof_complete_cardText');
    this.translateService.get('eportal_onboardingTR_technicalProof_provideData_cardTitle');
    this.translateService.get('eportal_onboardingTR_technicalProof_provideData_cardText');
    this.translateService.get('eportal_onboardingTR_technicalProof_provideData_alert');
    this.translateService.get('eportal_global_link_DIDtoolbox');
    this.translateService.get('eportal_onboardingTR_technicalProof_btnSec_openOverview');
    this.translateService.get('eportal_onboardingTR_technicalProof_submitProof_cardText');
    this.translateService.get('eportal_onboardingTR_development_emailTemplate_subject');
    this.translateService.get('eportal_onboardingTR_development_emailTemplate_body');
  }

  protected readonly AppRoutes = AppRoutes;
}
