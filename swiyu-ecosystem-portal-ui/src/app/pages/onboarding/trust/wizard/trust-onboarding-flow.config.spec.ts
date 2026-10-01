import {
  getTrustOnboardingFlowConfig,
  TRUST_STEP_SEGMENTS,
  TrustFieldId,
  TrustNotificationId,
  TrustOnboardingFlow
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
  'technicalProofCreateProofAlert'
];

describe('trustOnboardingFlowConfig', () => {
  describe('REGISTRATION', () => {
    const config = getTrustOnboardingFlowConfig(TrustOnboardingFlow.Registration);

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

    it('shows every static notification', () => {
      ALL_NOTIFICATION_IDS.forEach(id => {
        expect(config.notifications[id]).toBe(true);
      });
    });

    it('configures exactly the known notifications', () => {
      expect(Object.keys(config.notifications).sort()).toEqual([...ALL_NOTIFICATION_IDS].sort());
    });
  });

  it('uses the step ids as wizard route segments', () => {
    const config = getTrustOnboardingFlowConfig(TrustOnboardingFlow.Registration);

    expect(config.steps.map(step => step.id)).toEqual([...TRUST_STEP_SEGMENTS]);
  });

  it.each([TrustOnboardingFlow.ProfileChange, TrustOnboardingFlow.Renewal])(
    'falls back to the registration configuration for the not yet configured flow %s',
    flow => {
      expect(getTrustOnboardingFlowConfig(flow)).toBe(getTrustOnboardingFlowConfig(TrustOnboardingFlow.Registration));
    }
  );
});
