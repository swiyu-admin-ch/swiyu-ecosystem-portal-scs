import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import {AppRoutes} from '../../../../../app.routes';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {AbstractOnboardingStepComponent} from '../abstract-onboarding-step-component';

@Component({
  selector: 'app-onboarding-step-final',
  imports: [TranslatePipe, MatButtonModule, ObButtonModule, RouterLink],
  templateUrl: 'onboarding-step-final.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../onboarding-steps.scss']
})
export class OnboardingStepFinalComponent extends AbstractOnboardingStepComponent {
  protected readonly wizardService = inject(TrustOnboardingWizardService);
  protected readonly appConfigService = inject(AppConfigService);
  protected readonly AppRoutes = AppRoutes;

  validate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
