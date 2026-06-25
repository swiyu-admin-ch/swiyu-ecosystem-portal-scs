import {Component, inject, input, OnInit, signal} from '@angular/core';
import {MatAnchor, MatButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonDirective} from '@oblique/oblique';
import {
  BusinessPartner,
  BusinessPartnerApi,
  TrustOnboardingApi,
  TrustOnboardingSubmission
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {ProcessStepComponent} from '../../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../../shared/process/process.component';

@Component({
  selector: 'app-trust-introduction',
  imports: [
    TranslateModule,
    ObButtonDirective,
    MatAnchor,
    RouterLink,
    MatButton,
    ProcessComponent,
    ProcessStepComponent
  ],
  templateUrl: './trust-introduction.component.html',
  styleUrl: './trust-introduction.component.scss'
})
export class TrustIntroductionComponent implements OnInit {
  businessPartnerId = input.required<string>();
  partner = signal<BusinessPartner | null>(null);
  protected readonly AppRoutes = AppRoutes;
  protected readonly appConfigService = inject(AppConfigService);
  private readonly router = inject(Router);
  private readonly trustOnboardingApi = inject(TrustOnboardingApi);
  private readonly businessPartnerApi = inject(BusinessPartnerApi);

  ngOnInit(): void {
    this.businessPartnerApi
      .getBusinessPartner({
        businessPartnerId: this.businessPartnerId()
      })
      .subscribe({
        next: partner => {
          this.partner.set(partner);
        }
      });
  }

  startTrustOnboarding() {
    if (!this.businessPartnerId()) {
      throw new Error("Can't start trust onboarding since Partner ID is missing");
    }
    this.trustOnboardingApi
      .createTrustOnboardingSubmission({
        trustOnboardingSubmissionRequest: {
          partnerId: this.businessPartnerId()
        }
      })
      .subscribe({
        next: (submission: TrustOnboardingSubmission) => {
          void this.router.navigate(AppRoutes.trustOnboardingWizard(this.businessPartnerId(), submission.id));
        }
      });
  }
}
