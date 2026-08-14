import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import {
  BusinessPartner,
  BusinessPartnerTrustStatus,
  IdentifierResponse,
  IdentifierStatus,
  TrustOnboardingSubmission
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
  businessPartnerId = input.required<string>();
  remainingDidSlots = input<number>(0);

  showCreateIdentifier = computed(() => this.remainingDidSlots() > 0);

  showSensitiveDataAccess = computed(
    () =>
      this.appConfigService.featureToggles.EIDARTFE_1822_PROTECTED_VERIFICATION &&
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.Verified
  );

  showEnterIdentifiers = computed(
    () =>
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.Verified &&
      this.identifiers().some(id => id.status === IdentifierStatus.NotInitialized)
  );

  showSupplementRequest = computed(
    () =>
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.InformationRequested ||
      this.trustOnboardingSubmission()?.status === TrustOnboardingSubmission.StatusEnum.InformationRequested
  );

  showRenewVerification = computed(
    () => this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.ReVerificationStarted
    // here the future status IdentityVerificationProgressStatusDto.ReVerificationRequired from the new CBS endpoint
    // /{businessPartnerId}/verification-progress needs to be checked to start the re-verification process
    // EID-6624
  );

  showVerifyProfile = computed(
    () =>
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.NotVerified ||
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.VerificationStarted ||
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.VerificationInProgress ||
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.ReVerificationInProgress
  );

  showContinueVerification = computed(() => {
    return this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.VerificationStarted;
  });

  showVerificationInProgress = computed(() => {
    return (
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.VerificationInProgress ||
      this.businessPartner()?.trustVerificationStatus === BusinessPartnerTrustStatus.ReVerificationInProgress
    );
  });

  trustOnboardingStepActionRoute = computed(() => {
    const submission = this.trustOnboardingSubmission();
    if (!submission || submission.status == TrustOnboardingSubmission.StatusEnum.Rejected) {
      return AppRoutes.trustOnboardingIntroduction(this.businessPartnerId());
    }
    return getLastValidTrustStepRoute(submission);
  });

  protected readonly AppRoutes = AppRoutes;
}
