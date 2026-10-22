import {TrustOnboardingSubmissionType} from '../../../../api/generated';
import {
  getTrustOnboardingFlowConfig,
  TRUST_STEP_SEGMENTS,
  TrustFieldId,
  TrustNotificationId
} from './trust-onboarding-flow.config';

const ALL_FIELD_IDS: TrustFieldId[] = [
  'partnerType',
  'commercialRegister',
  'uid',
  'entityName',
  'entityAddress',
  'contactPerson',
  'signatories',
  'termsAndConditions',
  'privacyPolicy',
  'didSelection',
  'declarationOfIntent',
  'doiLanguage',
  'additionalDocuments',
  'popSummary',
  'setupVariant'
];

const ALL_NOTIFICATION_IDS: TrustNotificationId[] = [
  'profileIntro',
  'profileAutoApprovalWarning',
  'formalProofIntro',
  'formalProofAutoApprovalWarning',
  'formalProofSignatureAutoApprovalWarning',
  'technicalProofCreateProofAlert',
  'formalProofProfileChangedDoiDownloadWarning',
  'formalProofProfileChangedDoiUploadWarning'
];

const REGISTRATION_NOTIFICATION_EXPECTATIONS: Partial<Record<TrustNotificationId, boolean>> = {
  profileIntro: true,
  profileAutoApprovalWarning: true,
  formalProofIntro: true,
  formalProofAutoApprovalWarning: true,
  formalProofSignatureAutoApprovalWarning: true,
  technicalProofCreateProofAlert: true,
  formalProofProfileChangedDoiDownloadWarning: false,
  formalProofProfileChangedDoiUploadWarning: false
};

const PROFILE_CHANGE_NOTIFICATION_EXPECTATIONS: Partial<Record<TrustNotificationId, boolean>> = {
  profileIntro: true,
  profileAutoApprovalWarning: true,
  formalProofIntro: true,
  formalProofAutoApprovalWarning: true,
  formalProofSignatureAutoApprovalWarning: true,
  technicalProofCreateProofAlert: true,
  formalProofProfileChangedDoiDownloadWarning: true,
  formalProofProfileChangedDoiUploadWarning: true
};

describe('trustOnboardingFlowConfig', () => {
  describe('REGISTRATION', () => {
    const config = getTrustOnboardingFlowConfig(TrustOnboardingSubmissionType.Registration);

    it('shows all steps in the wizard order', () => {
      expect(config.steps.map(step => step.id)).toEqual([
        'profile',
        'dids',
        'formal-proof',
        'technical-proof',
        'approval'
      ]);
      expect(config.steps.every(step => step.visible)).toBe(true);
    });

    it('labels every step and offers the automatic approval label for the approval step only', () => {
      expect(config.steps.every(step => step.labelKey.length > 0)).toBe(true);
      expect(config.steps.filter(step => step.labelKeyAutomaticApproval).map(step => step.id)).toEqual(['approval']);
    });

    it('shows every field and keeps it editable', () => {
      ALL_FIELD_IDS.forEach(id => {
        expect(config.fields[id]).toEqual({visible: true, editable: true});
      });
    });

    it('configures exactly the known fields', () => {
      expect(Object.keys(config.fields).sort()).toEqual([...ALL_FIELD_IDS].sort());
    });

    it('shows the expected static notifications for the registration flow', () => {
      Object.entries(REGISTRATION_NOTIFICATION_EXPECTATIONS).forEach(([id, expected]) => {
        expect(config.notifications[id as TrustNotificationId]).toBe(expected);
      });
    });

    it('configures exactly the known notifications', () => {
      expect(Object.keys(config.notifications).sort()).toEqual([...ALL_NOTIFICATION_IDS].sort());
    });
  });

  describe('PROFILE_CHANGE', () => {
    const voluntaryConfig = getTrustOnboardingFlowConfig(TrustOnboardingSubmissionType.ProfileChangeVoluntary);
    const mandatoryConfig = getTrustOnboardingFlowConfig(TrustOnboardingSubmissionType.ProfileChangeMandatory);

    it('enables the profile-change DOI warnings in both profile change flows', () => {
      [voluntaryConfig, mandatoryConfig].forEach(config => {
        Object.entries(PROFILE_CHANGE_NOTIFICATION_EXPECTATIONS).forEach(([id, expected]) => {
          expect(config.notifications[id as TrustNotificationId]).toBe(expected);
        });
      });
    });
  });

  it('falls back to the registration flow for unsupported loaded types', () => {
    const config = getTrustOnboardingFlowConfig('UNSUPPORTED' as TrustOnboardingSubmissionType);

    expect(config.flow).toBe(TrustOnboardingSubmissionType.Registration);
  });

  it('uses the step ids as wizard route segments', () => {
    const config = getTrustOnboardingFlowConfig(TrustOnboardingSubmissionType.Registration);
    expect(config.steps.map(step => step.id)).toEqual([...TRUST_STEP_SEGMENTS]);
  });
});
