import {
  ProofOfPossession,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionDocumentListItem
} from '../../api/generated';
import {hasCompletedFormalProof, hasSelectedDids} from './trust-onboarding-step-requirements';

describe('trust-onboarding-step-requirements', () => {
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

  function createDocument(
    type: TrustOnboardingSubmissionDocumentListItem.TypeEnum
  ): TrustOnboardingSubmissionDocumentListItem {
    return {
      id: 'doc-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      name: 'doc.pdf',
      mediaType: 'application/pdf',
      type,
      owningBusinessPartner: PARTNER_ID,
      submittedAt: '2024-01-01',
      canBeDeleted: true
    };
  }

  describe('hasSelectedDids', () => {
    it('should return false when proofOfPossessionList is empty', () => {
      expect(hasSelectedDids(createSubmission({proofOfPossessionList: []}))).toBe(false);
    });

    it('should return true when proofOfPossessionList has entries', () => {
      expect(
        hasSelectedDids(
          createSubmission({
            proofOfPossessionList: [{did: 'did:key:1', nonce: 'n1', status: ProofOfPossession.StatusEnum.NotSupplied}]
          })
        )
      ).toBe(true);
    });
  });

  describe('hasCompletedFormalProof', () => {
    const doi = createDocument(TrustOnboardingSubmissionDocumentListItem.TypeEnum.TrustOnboardingDeclarationOfIntent);
    const other = createDocument(TrustOnboardingSubmissionDocumentListItem.TypeEnum.TrustOnboardingOther);

    it('should return false when no declaration of intent document exists', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.Individual
      });
      expect(hasCompletedFormalProof(submission, [])).toBe(false);
    });

    it('should return true for an INDIVIDUAL partner once the declaration of intent is uploaded', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.Individual
      });
      expect(hasCompletedFormalProof(submission, [doi])).toBe(true);
    });

    it('should return true for a BUSINESS partner registered in the commercial register with only the doi', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.Business,
        isRegisteredInCommercialRegister: true
      });
      expect(hasCompletedFormalProof(submission, [doi])).toBe(true);
    });

    it('should return false for a BUSINESS partner not registered in the commercial register without an additional document', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.Business,
        isRegisteredInCommercialRegister: false
      });
      expect(hasCompletedFormalProof(submission, [doi])).toBe(false);
    });

    it('should return true for a BUSINESS partner not registered in the commercial register once both documents exist', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.Business,
        isRegisteredInCommercialRegister: false
      });
      expect(hasCompletedFormalProof(submission, [doi, other])).toBe(true);
    });

    it('should return false for a GOVERNMENTAL_INSTITUTION partner without an additional document', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.GovernmentalInstitution
      });
      expect(hasCompletedFormalProof(submission, [doi])).toBe(false);
    });

    it('should return true for a GOVERNMENTAL_INSTITUTION partner once both documents exist', () => {
      const submission = createSubmission({
        businessPartnerType: TrustOnboardingSubmission.BusinessPartnerTypeEnum.GovernmentalInstitution
      });
      expect(hasCompletedFormalProof(submission, [doi, other])).toBe(true);
    });
  });
});
