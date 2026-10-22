/**
 * Per-flow configuration of the trust onboarding wizard.
 *
 * The wizard is shared between the different trust onboarding submission types. A flow configuration
 * declares which steps, fields and static notifications take part in a given flow and whether the user
 * may edit a field. It is purely declarative: the only logic in this file is the lookup at the bottom.
 */

import {TrustOnboardingSubmissionType} from '../../../../api/generated';

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
  | 'technicalProofCreateProofAlert'
  | 'formalProofProfileChangedDoiDownloadWarning'
  | 'formalProofProfileChangedDoiUploadWarning';

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
  flow: TrustOnboardingSubmissionType;
  /** Ordered; hidden steps are skipped when navigating. */
  steps: readonly TrustStepConfig[];
  fields: Readonly<Record<TrustFieldId, TrustFieldConfig>>;
  notifications: Readonly<Record<TrustNotificationId, boolean>>;
}

const VISIBLE_AND_EDITABLE: TrustFieldConfig = {visible: true, editable: true};
const VISIBLE: TrustFieldConfig = {visible: true, editable: false};
const HIDDEN: TrustFieldConfig = {visible: false, editable: false};

/** Reproduces the trust onboarding registration wizard as it behaved before it became configurable. */
const REGISTRATION_FLOW_CONFIG: TrustOnboardingFlowConfig = {
  flow: TrustOnboardingSubmissionType.Registration,
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
    formalProofProfileChangedDoiDownloadWarning: false,
    formalProofProfileChangedDoiUploadWarning: false,
    technicalProofCreateProofAlert: true
  }
};

/** Same as registration but no did selection step */
const PROFILE_CHANGE_VOLUNTARY_FLOW_CONFIG: TrustOnboardingFlowConfig = {
  flow: TrustOnboardingSubmissionType.ProfileChangeVoluntary,
  steps: [
    {
      id: 'profile',
      visible: true,
      labelKey: 'app_site_onboarding_trust_organisation-information_step'
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
    didSelection: VISIBLE,
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
    formalProofProfileChangedDoiDownloadWarning: true,
    formalProofProfileChangedDoiUploadWarning: true,
    technicalProofCreateProofAlert: true
  }
};

/** Same as PROFILE_CHANGE_VOLUNTARY_FLOW_CONFIG */
const PROFILE_CHANGE_MANDATORY_FLOW_CONFIG: TrustOnboardingFlowConfig = {
  ...PROFILE_CHANGE_VOLUNTARY_FLOW_CONFIG,
  flow: TrustOnboardingSubmissionType.ProfileChangeMandatory
};

const RENEWAL_FLOW_CONFIG: TrustOnboardingFlowConfig = {
  flow: TrustOnboardingSubmissionType.Renewal,
  steps: [
    {
      id: 'profile',
      visible: true,
      labelKey: 'app_site_onboarding_trust_organisation-information_step'
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
    partnerType: HIDDEN,
    commercialRegister: VISIBLE,
    uid: VISIBLE,
    entityName: VISIBLE,
    entityAddress: VISIBLE_AND_EDITABLE,
    contactPerson: VISIBLE_AND_EDITABLE,
    signatories: HIDDEN,
    termsAndConditions: VISIBLE_AND_EDITABLE,
    privacyPolicy: VISIBLE_AND_EDITABLE,
    didSelection: VISIBLE,
    declarationOfIntent: VISIBLE,
    doiLanguage: VISIBLE,
    additionalDocuments: VISIBLE,
    popSummary: VISIBLE,
    setupVariant: VISIBLE_AND_EDITABLE
  },
  notifications: {
    profileIntro: true,
    profileAutoApprovalWarning: true,
    formalProofIntro: true,
    formalProofAutoApprovalWarning: true,
    formalProofSignatureAutoApprovalWarning: true,
    technicalProofCreateProofAlert: true,
    formalProofProfileChangedDoiDownloadWarning: false,
    formalProofProfileChangedDoiUploadWarning: false
  }
};

const TRUST_ONBOARDING_FLOW_CONFIGS: Record<TrustOnboardingSubmissionType, TrustOnboardingFlowConfig> = {
  [TrustOnboardingSubmissionType.Registration]: REGISTRATION_FLOW_CONFIG,
  [TrustOnboardingSubmissionType.ProfileChangeVoluntary]: PROFILE_CHANGE_VOLUNTARY_FLOW_CONFIG,
  [TrustOnboardingSubmissionType.ProfileChangeMandatory]: PROFILE_CHANGE_MANDATORY_FLOW_CONFIG,
  [TrustOnboardingSubmissionType.Renewal]: RENEWAL_FLOW_CONFIG
};

/**
 * Returns the flow config for a known submission type.
 * Unsupported loaded types fall back to the registration flow.
 */
export function getTrustOnboardingFlowConfig(type: TrustOnboardingSubmissionType): TrustOnboardingFlowConfig {
  const config = TRUST_ONBOARDING_FLOW_CONFIGS[type];

  if (!config) {
    console.warn(
      `Warning: Unsupported TrustOnboardingSubmissionType %s to evaluate wizard config. Falling back to REGISTRATION_FLOW_CONFIG`,
      type
    );
    return REGISTRATION_FLOW_CONFIG;
  }

  console.log(`Info: Using TrustOnboardingFlowConfig for TrustOnboardingSubmissionType %s`, type);
  return config;
}
