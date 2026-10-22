import {ComponentRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {
  IdentifierResponse,
  IdentifierStatus,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionType,
  VerificationProgress,
  VerificationProgressStatus
} from '../../../api/generated';
import {AppRoutes} from '../../../app.routes';
import {AppConfigService} from '../../../core/appconfig/app-config.service';
import {BusinessPartnerDetailActionsComponent} from './business-partner-detail-actions.component';

const PARTNER_ID = 'partner-123';

const appConfigMock = {
  featureToggles: {EIDARTFE_1822_PROTECTED_VERIFICATION: true}
};

function createProgress(status: VerificationProgressStatus): VerificationProgress {
  return {status};
}

function createIdentifier(status: IdentifierStatus): IdentifierResponse {
  return {id: 'id-1', did: 'did:example:1', status};
}

function createSubmission(status: TrustOnboardingSubmission.StatusEnum): TrustOnboardingSubmission {
  return {
    id: 'sub-1',
    version: 1,
    partnerId: PARTNER_ID,
    entityName: {default: 'Test', 'de-CH': 'Test'},
    entityEmail: 'a@b.com',
    entityAddress: {street: 's', city: 'c', postalCode: '1', country: 'ch', region: 'r'},
    contactPerson: {
      firstName: 'F',
      lastName: 'L',
      email: 'a@b.com',
      phone: '0',
      address: {street: 's', city: 'c', postalCode: '1', country: 'ch', region: 'r'}
    },
    status,
    proofOfPossessionList: [],
    registryIds: {},
    type: TrustOnboardingSubmissionType.Registration,
    alerts: []
  };
}

describe('BusinessPartnerDetailActionsComponent', () => {
  let componentRef: ComponentRef<BusinessPartnerDetailActionsComponent>;
  let component: BusinessPartnerDetailActionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessPartnerDetailActionsComponent, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [provideObliqueTestingConfiguration(), {provide: AppConfigService, useValue: appConfigMock}]
    }).compileComponents();

    const fixture = TestBed.createComponent(BusinessPartnerDetailActionsComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('businessPartnerId', PARTNER_ID);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showCreateIdentifier', () => {
    it('is true when remainingDidSlots > 0', () => {
      componentRef.setInput('remainingDidSlots', 2);
      expect(component.showCreateIdentifier()).toBe(true);
    });

    it('is false when remainingDidSlots is 0', () => {
      componentRef.setInput('remainingDidSlots', 0);
      expect(component.showCreateIdentifier()).toBe(false);
    });
  });

  describe('showSensitiveDataAccess', () => {
    it('is true when partner is verified and the feature toggle is enabled', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      expect(component.showSensitiveDataAccess()).toBe(true);
    });

    it('is false when partner is not verified', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationNotStarted));
      expect(component.showSensitiveDataAccess()).toBe(false);
    });

    it('is false when the feature toggle is disabled, even if partner is verified', () => {
      appConfigMock.featureToggles.EIDARTFE_1822_PROTECTED_VERIFICATION = false;
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      expect(component.showSensitiveDataAccess()).toBe(false);
      appConfigMock.featureToggles.EIDARTFE_1822_PROTECTED_VERIFICATION = true;
    });
  });

  describe('showEnterIdentifiers', () => {
    it('is true when verified and at least one NotInitialized identifier', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      componentRef.setInput('identifiers', [createIdentifier(IdentifierStatus.NotInitialized)]);
      expect(component.showEnterIdentifiers()).toBe(true);
    });

    it('is false when verified but all identifiers are Initialized', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      componentRef.setInput('identifiers', [createIdentifier(IdentifierStatus.Initialized)]);
      expect(component.showEnterIdentifiers()).toBe(false);
    });

    it('is false when not verified, even with NotInitialized identifiers', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationNotStarted));
      componentRef.setInput('identifiers', [createIdentifier(IdentifierStatus.NotInitialized)]);
      expect(component.showEnterIdentifiers()).toBe(false);
    });
  });

  describe('showSupplementRequest', () => {
    it('is true when verification progress is VerificationInformationRequestedRequired', () => {
      componentRef.setInput(
        'verificationProgress',
        createProgress(VerificationProgressStatus.VerificationInformationRequestedRequired)
      );
      expect(component.showSupplementRequest()).toBe(true);
    });

    it('is true when verification progress is VerificationInformationRequestedStarted', () => {
      componentRef.setInput(
        'verificationProgress',
        createProgress(VerificationProgressStatus.VerificationInformationRequestedStarted)
      );
      expect(component.showSupplementRequest()).toBe(true);
    });

    it('is true when submission status is InformationRequested', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationInProgress));
      componentRef.setInput(
        'trustOnboardingSubmission',
        createSubmission(TrustOnboardingSubmission.StatusEnum.InformationRequested)
      );
      expect(component.showSupplementRequest()).toBe(true);
    });

    it('is false otherwise', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      componentRef.setInput(
        'trustOnboardingSubmission',
        createSubmission(TrustOnboardingSubmission.StatusEnum.Submitted)
      );
      expect(component.showSupplementRequest()).toBe(false);
    });
  });

  describe('showStartRenewVerification', () => {
    it('is true when verification progress is ReVerificationRequired or ReVerificationRejected', () => {
      for (const status of [
        VerificationProgressStatus.ReVerificationRequired,
        VerificationProgressStatus.ReVerificationRejected
      ]) {
        componentRef.setInput('verificationProgress', createProgress(status));
        expect(component.showStartRenewVerification()).toBe(true);
      }
    });

    it('is false for other statuses', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      expect(component.showStartRenewVerification()).toBe(false);
    });
  });

  describe('showContinueRenewVerification', () => {
    it('is true when verification progress is ReVerificationStarted', () => {
      for (const status of [VerificationProgressStatus.ReVerificationStarted]) {
        componentRef.setInput('verificationProgress', createProgress(status));
        expect(component.showContinueRenewVerification()).toBe(true);
      }
    });
  });

  describe('showVerifyProfile', () => {
    it('is true when partner is VerificationNotStarted, VerificationStarted, VerificationInProgress or ReVerificationInProgress', () => {
      for (const status of [
        VerificationProgressStatus.VerificationNotStarted,
        VerificationProgressStatus.VerificationStarted,
        VerificationProgressStatus.VerificationInProgress,
        VerificationProgressStatus.ReVerificationInProgress
      ]) {
        componentRef.setInput('verificationProgress', createProgress(status));
        expect(component.showVerifyProfile()).toBe(true);
      }
    });

    it('is false when partner is verified', () => {
      componentRef.setInput('verificationProgress', createProgress(VerificationProgressStatus.VerificationSucceeded));
      expect(component.showVerifyProfile()).toBe(false);
    });

    it('is false when partner is InformationRequested or ReVerificationRequired/Started/Rejected', () => {
      for (const status of [
        VerificationProgressStatus.VerificationInformationRequestedRequired,
        VerificationProgressStatus.VerificationInformationRequestedStarted,
        VerificationProgressStatus.ReVerificationRequired,
        VerificationProgressStatus.ReVerificationStarted,
        VerificationProgressStatus.ReVerificationRejected
      ]) {
        componentRef.setInput('verificationProgress', createProgress(status));
        expect(component.showVerifyProfile()).toBe(false);
      }
    });
  });

  describe('trustOnboardingStepActionRoute', () => {
    it('returns intro route when no submission exists', () => {
      componentRef.setInput('trustOnboardingSubmission', undefined);
      expect(component.trustOnboardingStepActionRoute()).toEqual(AppRoutes.trustOnboardingIntroduction(PARTNER_ID));
    });

    it('returns approval route when submission is Submitted', () => {
      const submission = createSubmission(TrustOnboardingSubmission.StatusEnum.Submitted);
      componentRef.setInput('trustOnboardingSubmission', submission);
      expect(component.trustOnboardingStepActionRoute()).toEqual(
        AppRoutes.trustOnboardingWizardStepApproval(PARTNER_ID, 'sub-1')
      );
    });
  });
});
