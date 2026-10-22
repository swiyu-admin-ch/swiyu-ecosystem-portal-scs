import {Component, inject, input, OnInit, signal} from '@angular/core';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonDirective, ObSelectableGroupDirective} from '@oblique/oblique';
import {
  BusinessPartner,
  BusinessPartnerApi,
  TrustOnboardingApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionRequest
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {ProcessStepComponent} from '../../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../../shared/process/process.component';
import {RadioCardComponent} from '../../../../shared/radio-card/radio-card.component';

export enum RenewalOption {
  // simple renewal, no profile data can be changed
  Renewal = 'Renewal',
  // a renewal which includes profile changes as well
  ProfileChangeMandatory = 'ProfileChangeMandatory'
}

@Component({
  selector: 'app-renewal-introduction',
  imports: [
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    ObButtonDirective,
    ObSelectableGroupDirective,
    MatAnchor,
    RouterLink,
    MatButton,
    MatIcon,
    ProcessComponent,
    ProcessStepComponent,
    RadioCardComponent
  ],
  templateUrl: './renewal-introduction.component.html',
  styleUrl: './renewal-introduction.component.scss'
})
export class RenewalIntroductionComponent implements OnInit {
  businessPartnerId = input.required<string>();
  partner = signal<BusinessPartner | undefined>(undefined);
  protected selectedRenewalOption = signal<RenewalOption | undefined>(undefined);
  protected visibleProcessSection = signal<RenewalOption | undefined>(undefined);
  protected renewalError = signal(false);
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

  onCardSelect(option: RenewalOption) {
    if (this.selectedRenewalOption() !== option) {
      this.visibleProcessSection.set(undefined);
    }
    this.selectedRenewalOption.set(option);
    this.renewalError.set(false);
  }

  startRenewalOrProfileChangeMandatory() {
    const selectedOption = this.selectedRenewalOption();

    if (!selectedOption) {
      this.renewalError.set(true);
      return;
    }

    if (!this.visibleProcessSection()) {
      this.visibleProcessSection.set(selectedOption);
      return;
    }

    if (!this.businessPartnerId()) {
      throw new Error("Can't start trust onboarding renewal since Partner ID is missing");
    }
    const submissionType =
      selectedOption === RenewalOption.Renewal
        ? TrustOnboardingSubmissionRequest.SubmissionTypeEnum.Renewal
        : TrustOnboardingSubmissionRequest.SubmissionTypeEnum.ProfileChangeMandatory;

    this.trustOnboardingApi
      .createTrustOnboardingSubmission({
        trustOnboardingSubmissionRequest: {
          partnerId: this.businessPartnerId(),
          submissionType
        }
      })
      .subscribe({
        next: (submission: TrustOnboardingSubmission) => {
          void this.router.navigate(AppRoutes.trustOnboardingWizard(this.businessPartnerId(), submission.id));
        }
      });
  }

  protected readonly RenewalOption = RenewalOption;
}
