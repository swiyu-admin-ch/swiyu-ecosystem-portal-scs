import {ProofOfPossession, TrustOnboardingSubmission} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {getLastValidTrustStepRoute} from './last-valid-trust-step-route';

describe('getLastValidTrustStepRoute', () => {
  const PARTNER_ID = 'partner-123';
  const SUBMISSION_ID = 'sub-456';

  function createSubmission(overrides: Partial<TrustOnboardingSubmission> = {}): TrustOnboardingSubmission {
    return {
      id: SUBMISSION_ID,
      version: 1,
      partnerId: PARTNER_ID,
      entityName: {default: 'Test', 'de-CH': 'Test'},
      entityEmail: 'test@test.com',
      entityAddress: {street: 's', city: 'c', postalCode: '1234', country: 'CH'},
      contactPerson: {firstName: 'F', lastName: 'L', phone: '123', email: 'f@l.com'},
      status: TrustOnboardingSubmission.StatusEnum.Unsubmitted,
      proofOfPossessionList: [],
      registryIds: {},
      ...overrides
    };
  }

  it('should return approval route for submitted status', () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Submitted});
    expect(getLastValidTrustStepRoute(submission)).toEqual(
      AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should return approval route for succeeded status', () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Succeeded});
    expect(getLastValidTrustStepRoute(submission)).toEqual(
      AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should return approval route for rejected status', () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Rejected});
    expect(getLastValidTrustStepRoute(submission)).toEqual(
      AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should return technical-proof route when a proof has been supplied', () => {
    const submission = createSubmission({
      proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.Valid}]
    });
    expect(getLastValidTrustStepRoute(submission)).toEqual(
      AppRoutes.trustOnboardingTechnicalProof(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should return dids route when proofs exist but none are supplied', () => {
    const submission = createSubmission({
      proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.NotSupplied}]
    });
    expect(getLastValidTrustStepRoute(submission)).toEqual(AppRoutes.trustOnboardingDids(PARTNER_ID, SUBMISSION_ID));
  });

  it('should return profile route for unsubmitted with no data', () => {
    const submission = createSubmission();
    expect(getLastValidTrustStepRoute(submission)).toEqual(AppRoutes.trustOnboardingProfile(PARTNER_ID, SUBMISSION_ID));
  });
});
