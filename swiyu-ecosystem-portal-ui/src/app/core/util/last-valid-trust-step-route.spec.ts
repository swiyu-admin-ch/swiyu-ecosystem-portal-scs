import {of} from 'rxjs';
import {
  ProofOfPossession,
  TrustOnboardingDocumentsApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionDocumentListItem
} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {getLastValidTrustStepRoute, getLastValidTrustStepRoute$} from './last-valid-trust-step-route';

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

  it('should return approval route for resubmitted status', () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Resubmitted});
    expect(getLastValidTrustStepRoute(submission)).toEqual(
      AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should always return profile route for information_requested status', () => {
    const submission = createSubmission({
      status: TrustOnboardingSubmission.StatusEnum.InformationRequested,
      proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.Valid}]
    });
    expect(getLastValidTrustStepRoute(submission)).toEqual(AppRoutes.trustOnboardingProfile(PARTNER_ID, SUBMISSION_ID));
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

describe('getLastValidTrustStepRoute$', () => {
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

  function createDocumentsApi(documents: TrustOnboardingSubmissionDocumentListItem[] = []) {
    return {
      listAllDocumentsForTrustOnboarding: jest.fn().mockReturnValue(of({content: documents}))
    } as unknown as TrustOnboardingDocumentsApi;
  }

  function runFn(submission: TrustOnboardingSubmission, documentsApi = createDocumentsApi()): Promise<string[]> {
    return new Promise(resolve => {
      getLastValidTrustStepRoute$(submission, documentsApi).subscribe(resolve);
    });
  }

  it('should return approval route for submitted status', async () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Submitted});
    expect(await runFn(submission)).toEqual(AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID));
  });

  it('should return approval route for succeeded status', async () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Succeeded});
    expect(await runFn(submission)).toEqual(AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID));
  });

  it('should return approval route for rejected status', async () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Rejected});
    expect(await runFn(submission)).toEqual(AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID));
  });

  it('should return approval route for resubmitted status', async () => {
    const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Resubmitted});
    expect(await runFn(submission)).toEqual(AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID));
  });

  it('should always return profile route for information_requested status', async () => {
    const submission = createSubmission({
      status: TrustOnboardingSubmission.StatusEnum.InformationRequested,
      proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.NotSupplied}]
    });
    expect(await runFn(submission, createDocumentsApi([]))).toEqual(
      AppRoutes.trustOnboardingProfile(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should return profile route for unsubmitted with no data', async () => {
    const submission = createSubmission();
    expect(await runFn(submission)).toEqual(AppRoutes.trustOnboardingProfile(PARTNER_ID, SUBMISSION_ID));
  });

  it('should return formal-proof route when dids are selected but no documents are uploaded', async () => {
    const submission = createSubmission({
      proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.NotSupplied}]
    });
    expect(await runFn(submission, createDocumentsApi([]))).toEqual(
      AppRoutes.trustOnboardingFormalProof(PARTNER_ID, SUBMISSION_ID)
    );
  });

  it('should return technical-proof route when dids are selected and required documents are uploaded', async () => {
    const submission = createSubmission({
      proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.NotSupplied}]
    });
    const documentsApi = createDocumentsApi([
      {
        id: 'doc-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        name: 'doi.pdf',
        mediaType: 'application/pdf',
        type: TrustOnboardingSubmissionDocumentListItem.TypeEnum.TrustOnboardingDeclarationOfIntent,
        owningBusinessPartner: PARTNER_ID,
        submittedAt: '2024-01-01',
        canBeDeleted: true
      }
    ]);
    expect(await runFn(submission, documentsApi)).toEqual(
      AppRoutes.trustOnboardingTechnicalProof(PARTNER_ID, SUBMISSION_ID)
    );
  });
});
