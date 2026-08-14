import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import {AppRoutes} from '../../../../../app.routes';
import {AbstractOnboardingStepComponent} from '../../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {ProtectedVerificationWizardService} from '../../wizard/protected-verification-wizard.service';

@Component({
  selector: 'app-protected-verification-step-confirmation',
  templateUrl: './protected-verification-step-confirmation.component.html',
  styleUrls: ['../../../../onboarding/trust/steps/onboarding-steps.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MatButtonModule, ObButtonModule, RouterLink],
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: ProtectedVerificationStepConfirmationComponent}]
})
export class ProtectedVerificationStepConfirmationComponent extends AbstractOnboardingStepComponent implements OnInit {
  protected readonly wizardService = inject(ProtectedVerificationWizardService);
  protected readonly AppRoutes = AppRoutes;
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Guards against reaching this "success" screen directly (bookmark, back button, typed
    // URL) without an actual submission having happened in this session.
    if (!this.wizardService.submission() && this.wizardService.partnerId) {
      this.router.navigate([...AppRoutes.protectedVerificationWizard(this.wizardService.partnerId), 'category']);
    }
  }

  override validate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
