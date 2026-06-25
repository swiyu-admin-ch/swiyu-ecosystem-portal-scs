import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ObAlertComponent, ObButtonDirective, ObSelectableGroupDirective} from '@oblique/oblique';
import {AppRoutes} from '../../../../../app.routes';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {ClipboardComponent} from '../../../../../shared/clipboard/clipboard.component';
import {MailtoTemplateService} from '../../../../../shared/email/mailto-template.service';
import {ProcessStepComponent} from '../../../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../../../shared/process/process.component';
import {RadioCardComponent} from '../../../../../shared/radio-card/radio-card.component';
import {AbstractOnboardingStepComponent} from '../../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {PartnerRegistrationWizardService} from '../../wizard/partner-registration-wizard.service';

// Variants of handover displayed to the user
export enum SetupVariant {
  EXPERT = 'expert',
  SELF = 'self'
}

@Component({
  selector: 'app-handover-step',
  imports: [
    TranslatePipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    ObAlertComponent,
    ObSelectableGroupDirective,
    ReactiveFormsModule,
    MatIcon,
    ProcessComponent,
    ProcessStepComponent,
    ClipboardComponent,
    MatCardTitle,
    MatButton,
    ObButtonDirective,
    RadioCardComponent,
    RouterLink
  ],
  templateUrl: './partner-registration-handover-step.component.html',
  styleUrls: ['./partner-registration-handover-step.component.scss'],
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: PartnerRegistrationHandoverStepComponent}]
})
export class PartnerRegistrationHandoverStepComponent extends AbstractOnboardingStepComponent {
  protected readonly wizardService = inject(PartnerRegistrationWizardService);
  protected readonly AppRoutes = AppRoutes;
  registrationCompleted = signal<boolean>(false);
  variantStepCompleted = signal<boolean>(false);
  readonly SetupVariant = SetupVariant;
  protected readonly appConfig = inject(AppConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly mailtoTemplateService = inject(MailtoTemplateService);
  private readonly translateService = inject(TranslateService);
  readonly setupForm = this.fb.group({
    setupVariant: this.fb.control<SetupVariant | null>(null, Validators.required)
  });
  readonly mailtoLink = computed(() => {
    return this.mailtoTemplateService.buildHandoverMailtoLink({
      subjectKey: 'eportal_onboarding_development_emailTemplate_subject',
      bodyKey: 'eportal_onboarding_development_emailTemplate_body'
    });
  });

  get eportalInviteLink() {
    return `${this.appConfig.eportalUrl}/manage-users/permissions/businessPartner/${this.wizardService.partner()?.id}/userManagement`;
  }

  constructor() {
    super();
    this.translateSetup();
  }

  override validate(): Promise<boolean> {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
    }

    if (this.setupForm.valid && !this.variantStepCompleted()) {
      this.variantStepCompleted.set(true);
      return Promise.resolve(false);
    }

    if (this.variantStepCompleted()) {
      this.registrationCompleted.set(true);
      return Promise.resolve(false);
    }

    return Promise.resolve(false);
  }

  selectSetupVariant(variant: SetupVariant): void {
    this.setupForm.patchValue({setupVariant: variant});
  }

  private translateSetup() {
    this.translateService.get('eportal_onboarding_development_emailTemplate_subject');
    this.translateService.get('eportal_onboarding_development_emailTemplate_body');
  }
}
