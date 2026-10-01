/**
 * Per-flow configuration of the trust onboarding wizard.
 *
 * The wizard is shared between the different trust onboarding submission types. A flow configuration
 * declares which steps, fields and static notifications take part in a given flow and whether the user
 * may edit a field. It is purely declarative: the only logic in this file is the lookup at the bottom.
 */

/**
 * Trust onboarding submission types. The values mirror the `type` enum of the CBS
 * `TrustOnboardingSubmission` so the two line up once the portal DTO exposes that field.
 */
export const TrustOnboardingFlow = {
  Registration: 'REGISTRATION',
  ProfileChange: 'PROFILE_CHANGE',
  Renewal: 'RENEWAL'
} as const;
export type TrustOnboardingFlow = (typeof TrustOnboardingFlow)[keyof typeof TrustOnboardingFlow];

/** Step ids double as the wizard's child route segments. */
export const TRUST_STEP_SEGMENTS = ['profile', 'dids', 'formal-proof', 'technical-proof', 'approval'] as const;
export type TrustStepId = (typeof TRUST_STEP_SEGMENTS)[number];

/** Configurable fields, grouped by the step that owns them. */
export type TrustFieldId =
  // profile step
  | 'partnerType'
  | 'commercialRegister'
  | 'uid'
  | 'entityName'
  | 'entityAddress'
  | 'contactPerson'
  | 'signatories'
  | 'termsAndConditions'
  | 'privacyPolicy'
  // dids step
  | 'didSelection'
  // formal-proof step
  | 'declarationOfIntent'
  | 'doiLanguage'
  | 'additionalDocuments'
  // technical-proof step
  | 'popSummary'
  | 'setupVariant';

/** Static (non-dismissible, content-bound) notifications rendered inside the steps. */
export type TrustNotificationId =
  | 'profileIntro'
  | 'profileAutoApprovalWarning'
  | 'formalProofIntro'
  | 'formalProofAutoApprovalWarning'
  | 'formalProofSignatureAutoApprovalWarning'
  | 'technicalProofCreateProofAlert';

export interface TrustStepConfig {
  id: TrustStepId;
  visible: boolean;
  labelKey: string;
  /** Used instead of labelKey when functionalityConfig.automaticApprovalEnabled is on. */
  labelKeyAutomaticApproval?: string;
}

export interface TrustFieldConfig {
  visible: boolean;
  editable: boolean;
}

export interface TrustOnboardingFlowConfig {
  flow: TrustOnboardingFlow;
  /** Ordered; hidden steps are skipped when navigating. */
  steps: readonly TrustStepConfig[];
  fields: Readonly<Record<TrustFieldId, TrustFieldConfig>>;
  notifications: Readonly<Record<TrustNotificationId, boolean>>;
}

const VISIBLE_AND_EDITABLE: TrustFieldConfig = {visible: true, editable: true};

/** Reproduces the trust onboarding registration wizard as it behaved before it became configurable. */
const REGISTRATION_FLOW_CONFIG: TrustOnboardingFlowConfig = {
  flow: TrustOnboardingFlow.Registration,
  steps: [
    {
      id: 'profile',
      visible: true,
      labelKey: 'app_site_onboarding_trust_organisation-information_step'
    },
    {
      id: 'dids',
      visible: true,
      labelKey: 'app_site_onboarding_trust_dids_step'
    },
    {
      id: 'formal-proof',
      visible: true,
      labelKey: 'app_site_onboarding_trust_documents_step'
    },
    {
      id: 'technical-proof',
      visible: true,
      labelKey: 'app_site_onboarding_trust_technical-verification_step'
    },
    {
      id: 'approval',
      visible: true,
      labelKey: 'app_site_onboarding_trust_final_step',
      labelKeyAutomaticApproval: 'eportal_site_onboarding_trust_final_automatic_step'
    }
  ],
  fields: {
    partnerType: VISIBLE_AND_EDITABLE,
    commercialRegister: VISIBLE_AND_EDITABLE,
    uid: VISIBLE_AND_EDITABLE,
    entityName: VISIBLE_AND_EDITABLE,
    entityAddress: VISIBLE_AND_EDITABLE,
    contactPerson: VISIBLE_AND_EDITABLE,
    signatories: VISIBLE_AND_EDITABLE,
    termsAndConditions: VISIBLE_AND_EDITABLE,
    privacyPolicy: VISIBLE_AND_EDITABLE,
    didSelection: VISIBLE_AND_EDITABLE,
    declarationOfIntent: VISIBLE_AND_EDITABLE,
    doiLanguage: VISIBLE_AND_EDITABLE,
    additionalDocuments: VISIBLE_AND_EDITABLE,
    popSummary: VISIBLE_AND_EDITABLE,
    setupVariant: VISIBLE_AND_EDITABLE
  },
  notifications: {
    profileIntro: true,
    profileAutoApprovalWarning: true,
    formalProofIntro: true,
    formalProofAutoApprovalWarning: true,
    formalProofSignatureAutoApprovalWarning: true,
    technicalProofCreateProofAlert: true
  }
};

const TRUST_ONBOARDING_FLOW_CONFIGS: Partial<Record<TrustOnboardingFlow, TrustOnboardingFlowConfig>> = {
  [TrustOnboardingFlow.Registration]: REGISTRATION_FLOW_CONFIG
};

/**
 * PROFILE_CHANGE and RENEWAL have no configuration yet and fall back to the registration flow until
 * their own tickets define them.
 */
export function getTrustOnboardingFlowConfig(flow: TrustOnboardingFlow): TrustOnboardingFlowConfig {
  return TRUST_ONBOARDING_FLOW_CONFIGS[flow] ?? REGISTRATION_FLOW_CONFIG;
}
