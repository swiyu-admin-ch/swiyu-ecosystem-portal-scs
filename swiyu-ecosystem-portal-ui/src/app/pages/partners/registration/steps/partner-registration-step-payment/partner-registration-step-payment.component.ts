import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ObAlertComponent, ObButtonModule} from '@oblique/oblique';
import {AbstractOnboardingStepComponent} from '../../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {PartnerRegistrationWizardService} from '../../wizard/partner-registration-wizard.service';

@Component({
  selector: 'app-partner-registration-step-payment',
  imports: [ReactiveFormsModule, TranslatePipe, ObAlertComponent, MatButtonModule, ObButtonModule],
  templateUrl: 'partner-registration-step-payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: PartnerRegistrationStepPaymentComponent}],
  styleUrls: ['partner-registration-step-payment.component.scss']
})
export class PartnerRegistrationStepPaymentComponent extends AbstractOnboardingStepComponent {
  protected readonly wizardService = inject(PartnerRegistrationWizardService);

  override validate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
