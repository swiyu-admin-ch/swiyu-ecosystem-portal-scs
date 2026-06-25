import {Component, computed, inject, OnInit} from '@angular/core';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObButtonDirective} from '@oblique/oblique';
import {AppRoutes} from '../../../../app.routes';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {UserProfileService} from '../../../../core/user/user-profile.service';
import {InfoIconComponent} from '../../../../shared/info-icon/info-icon.component';
import {ProcessStepComponent} from '../../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../../shared/process/process.component';

interface RegistrationStep {
  title: string;
  subtitle: string;
  description: string; // renamed from 'content'
}

@Component({
  selector: 'app-partner-registration-introduction',
  imports: [
    TranslateModule,
    ObButtonDirective,
    MatAnchor,
    MatButton,
    MatIcon,
    ProcessComponent,
    ProcessStepComponent,
    InfoIconComponent
  ],
  templateUrl: './partner-registration-introduction.component.html',
  styleUrl: './partner-registration-introduction.component.scss'
})
export class PartnerRegistrationIntroductionComponent implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  protected readonly appConfigService = inject(AppConfigService);
  protected readonly registrationSteps = this.createRegistrationSteps();
  protected readonly stepsPerRow = 4;
  private readonly userProfileService = inject(UserProfileService);
  readonly isGovernmentalAllowlistUser = computed(
    () => this.userProfileService.userProfile$?.value?.isGovernmental ?? false
  );

  ngOnInit(): void {
    this.translateSetup();
  }

  startRegistration() {
    this.router.navigate(AppRoutes.baseOnboardingWizard());
  }

  private createRegistrationSteps(): RegistrationStep[] {
    const steps = [];
    steps.push({
      title: 'eportal_onboarding_start_cardTitle_productSelection',
      subtitle: 'eportal_onboarding_start_cardHint_productSelection',
      description: 'eportal_onboarding_start_cardText_productSelection'
    });
    steps.push({
      title: 'eportal_onboarding_start_cardTitle_profileCreation',
      subtitle: 'eportal_onboarding_start_cardHint_profileCreation',
      description: 'eportal_onboarding_start_cardText_profileCreation'
    });
    if (this.appConfigService.isFunctionalityPaymentEnabled) {
      steps.push({
        title: 'eportal_onboarding_start_cardTitle_paymentOptions',
        subtitle: 'eportal_onboarding_start_cardHint_paymentOptions',
        description: 'eportal_onboarding_start_cardText_paymentOptions'
      });
    }
    steps.push({
      title: 'eportal_onboarding_start_cardTitle_handover',
      subtitle: 'eportal_onboarding_start_cardHint_handover',
      description: 'eportal_onboarding_start_cardText_handover'
    });
    return steps;
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_onboarding_start_cardTitle_productSelection');
    this.translateService.get('eportal_onboarding_start_cardHint_productSelection');
    this.translateService.get('eportal_onboarding_start_cardText_productSelection');
    this.translateService.get('eportal_onboarding_start_cardTitle_profileCreation');
    this.translateService.get('eportal_onboarding_start_cardHint_profileCreation');
    this.translateService.get('eportal_onboarding_start_cardText_profileCreation');
    this.translateService.get('eportal_onboarding_start_cardTitle_paymentOptions');
    this.translateService.get('eportal_onboarding_start_cardHint_paymentOptions');
    this.translateService.get('eportal_onboarding_start_cardText_paymentOptions');
    this.translateService.get('eportal_onboarding_start_cardTitle_handover');
    this.translateService.get('eportal_onboarding_start_cardHint_handover');
    this.translateService.get('eportal_onboarding_start_cardText_handover');
  }
}
