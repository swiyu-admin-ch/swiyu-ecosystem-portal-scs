import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import {
  BusinessPartner,
  IdentifierResponse,
  IdentifierStatus,
  TrustOnboardingSubmission,
  VerificationProgress,
  VerificationProgressStatus
} from '../../../api/generated';
import {AppRoutes} from '../../../app.routes';
import {AppConfigService} from '../../../core/appconfig/app-config.service';
import {getLastValidTrustStepRoute} from '../../../core/util/last-valid-trust-step-route';

@Component({
  selector: 'app-business-partner-detail-actions',
  templateUrl: './business-partner-detail-actions.component.html',
  styleUrl: './business-partner-detail-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, ObButtonModule]
})
export class BusinessPartnerDetailActionsComponent {
  private readonly appConfigService = inject(AppConfigService);

  businessPartner = input<BusinessPartner | undefined>();
  identifiers = input<IdentifierResponse[]>([]);
  trustOnboardingSubmission = input<TrustOnboardingSubmission | undefined>();
  verificationProgress = input<VerificationProgress | undefined>();
  businessPartnerId = input.required<string>();
  remainingDidSlots = input<number>(0);

  showCreateIdentifier = computed(() => this.remainingDidSlots() > 0);

  showSensitiveDataAccess = computed(
    () => this.appConfigService.featureToggles.EIDARTFE_1822_PROTECTED_VERIFICATION && this.isVerified()
  );

  showEnterIdentifiers = computed(
    () => this.isVerified() && this.identifiers().some(id => id.status === IdentifierStatus.NotInitialized)
  );

  showSupplementRequest = computed(
    () =>
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationInformationRequestedRequired ||
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationInformationRequestedStarted ||
      this.trustOnboardingSubmission()?.status === TrustOnboardingSubmission.StatusEnum.InformationRequested
  );

  showStartRenewVerification = computed(
    () =>
      this.verificationProgress()?.status === VerificationProgressStatus.ReVerificationRequired ||
      this.verificationProgress()?.status === VerificationProgressStatus.ReVerificationRejected
  );

  showContinueRenewVerification = computed(
    () => this.verificationProgress()?.status === VerificationProgressStatus.ReVerificationStarted
  );

  showVerifyProfile = computed(
    () =>
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationNotStarted ||
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationStarted ||
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationInProgress ||
      this.verificationProgress()?.status === VerificationProgressStatus.ReVerificationInProgress
  );

  showContinueVerification = computed(() => {
    return this.verificationProgress()?.status === VerificationProgressStatus.VerificationStarted;
  });

  showVerificationInProgress = computed(() => {
    return (
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationInProgress ||
      this.verificationProgress()?.status === VerificationProgressStatus.ReVerificationInProgress
    );
  });

  private readonly isVerified = computed(
    () =>
      this.verificationProgress()?.status === VerificationProgressStatus.VerificationSucceeded ||
      this.verificationProgress()?.status === VerificationProgressStatus.ReVerificationSucceeded
  );

  trustOnboardingStepActionRoute = computed(() => {
    const submission = this.trustOnboardingSubmission();
    if (!submission || submission.status == TrustOnboardingSubmission.StatusEnum.Rejected) {
      return AppRoutes.trustOnboardingIntroduction(this.businessPartnerId());
    }
    return getLastValidTrustStepRoute(submission);
  });

  trustOnboardingContinueRenewalActionRoute = computed(() => {
    const submission = this.trustOnboardingSubmission();
    if (!submission) {
      // should not happen, just a fallback
      return AppRoutes.trustOnboardingIntroductionRenewal(this.businessPartnerId());
    }
    return AppRoutes.trustOnboardingWizard(this.businessPartnerId(), submission?.id);
  });

  protected readonly AppRoutes = AppRoutes;
}
