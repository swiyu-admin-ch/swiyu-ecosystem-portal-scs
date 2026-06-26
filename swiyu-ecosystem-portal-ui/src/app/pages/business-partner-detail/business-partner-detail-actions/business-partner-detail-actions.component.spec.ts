import {ComponentRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {
  BusinessPartner,
  BusinessPartnerTrustStatus,
  IdentifierResponse,
  IdentifierStatus,
  TrustOnboardingSubmission
} from '../../../api/generated';
import {AppRoutes} from '../../../app.routes';
import {BusinessPartnerDetailActionsComponent} from './business-partner-detail-actions.component';

const PARTNER_ID = 'partner-123';

function createPartner(trustVerificationStatus: BusinessPartnerTrustStatus, payedForDIDSlots = 5): BusinessPartner {
  return {
    id: PARTNER_ID,
    name: 'Test',
    entityName: {default: 'Test', 'de-CH': 'Test'},
    contactEmailAddress: 'a@b.com',
    contactPhone: '0',
    type: BusinessPartner.TypeEnum.Business,
    trustVerificationStatus,
    payedForDIDSlots
  };
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
    registryIds: {}
  };
}

describe('BusinessPartnerDetailActionsComponent', () => {
  let componentRef: ComponentRef<BusinessPartnerDetailActionsComponent>;
  let component: BusinessPartnerDetailActionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessPartnerDetailActionsComponent, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [provideObliqueTestingConfiguration()]
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
    it('is true when partner is Verified', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.Verified));
      expect(component.showSensitiveDataAccess()).toBe(true);
    });

    it('is false when partner is not Verified', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.NotVerified));
      expect(component.showSensitiveDataAccess()).toBe(false);
    });
  });

  describe('showEnterIdentifiers', () => {
    it('is true when Verified and at least one NotInitialized identifier', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.Verified));
      componentRef.setInput('identifiers', [createIdentifier(IdentifierStatus.NotInitialized)]);
      expect(component.showEnterIdentifiers()).toBe(true);
    });

    it('is false when Verified but all identifiers are Initialized', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.Verified));
      componentRef.setInput('identifiers', [createIdentifier(IdentifierStatus.Initialized)]);
      expect(component.showEnterIdentifiers()).toBe(false);
    });

    it('is false when not Verified, even with NotInitialized identifiers', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.NotVerified));
      componentRef.setInput('identifiers', [createIdentifier(IdentifierStatus.NotInitialized)]);
      expect(component.showEnterIdentifiers()).toBe(false);
    });
  });

  describe('showSupplementRequest', () => {
    it('is true when partner trustVerificationStatus is InformationRequested', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.InformationRequested));
      expect(component.showSupplementRequest()).toBe(true);
    });

    it('is true when submission status is InformationRequested', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.VerificationInProgress));
      componentRef.setInput(
        'trustOnboardingSubmission',
        createSubmission(TrustOnboardingSubmission.StatusEnum.InformationRequested)
      );
      expect(component.showSupplementRequest()).toBe(true);
    });

    it('is false otherwise', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.Verified));
      componentRef.setInput(
        'trustOnboardingSubmission',
        createSubmission(TrustOnboardingSubmission.StatusEnum.Submitted)
      );
      expect(component.showSupplementRequest()).toBe(false);
    });
  });

  describe('showRenewVerification', () => {
    it('is true when trustVerificationStatus is ReVerificationStarted', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.ReVerificationStarted));
      expect(component.showRenewVerification()).toBe(true);
    });

    it('is true when trustVerificationStatus is ReVerificationInProgress', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.ReVerificationInProgress));
      expect(component.showRenewVerification()).toBe(true);
    });

    it('is false for other statuses', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.Verified));
      expect(component.showRenewVerification()).toBe(false);
    });
  });

  describe('showVerifyProfile', () => {
    it('is true when partner is not Verified', () => {
      for (const status of [
        BusinessPartnerTrustStatus.NotVerified,
        BusinessPartnerTrustStatus.VerificationStarted,
        BusinessPartnerTrustStatus.VerificationInProgress,
        BusinessPartnerTrustStatus.InformationRequested,
        BusinessPartnerTrustStatus.ReVerificationStarted,
        BusinessPartnerTrustStatus.ReVerificationInProgress
      ]) {
        componentRef.setInput('businessPartner', createPartner(status));
        expect(component.showVerifyProfile()).toBe(true);
      }
    });

    it('is false when partner is Verified', () => {
      componentRef.setInput('businessPartner', createPartner(BusinessPartnerTrustStatus.Verified));
      expect(component.showVerifyProfile()).toBe(false);
    });
  });

  describe('onboardingProcessStarted', () => {
    it('is true when submission is provided', () => {
      componentRef.setInput(
        'trustOnboardingSubmission',
        createSubmission(TrustOnboardingSubmission.StatusEnum.Unsubmitted)
      );
      expect(component.onboardingProcessStarted()).toBe(true);
    });

    it('is false when submission is undefined', () => {
      componentRef.setInput('trustOnboardingSubmission', undefined);
      expect(component.onboardingProcessStarted()).toBe(false);
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
        AppRoutes.trustOnboardingApproval(PARTNER_ID, 'sub-1')
      );
    });
  });
});
