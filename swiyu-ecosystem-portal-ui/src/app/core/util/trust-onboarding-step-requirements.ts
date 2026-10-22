import {map, Observable} from 'rxjs';
import {
  TrustOnboardingDocumentsApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionDocumentListItem
} from '../../api/generated';

export function hasSelectedDids(submission: TrustOnboardingSubmission): boolean {
  return (submission.proofOfPossessionList?.length ?? 0) > 0;
}

// Additional documents are only required for BUSINESS partners that are not registered in the
// commercial register (i.e. have no UID) and for GOVERNMENTAL_INSTITUTION partners.
// @see OnboardingStepDocumentsComponent.showAdditionalDocuments
function submissionRequiresAdditionalDocument(submission: TrustOnboardingSubmission): boolean {
  return requiresAdditionalDocument(submission.businessPartnerType, submission.isRegisteredInCommercialRegister);
}

export function requiresAdditionalDocument(
  partnerType?: TrustOnboardingSubmission.BusinessPartnerTypeEnum,
  isRegisteredInCommercialRegister?: boolean
): boolean {
  return (
    (partnerType === TrustOnboardingSubmission.BusinessPartnerTypeEnum.Business &&
      isRegisteredInCommercialRegister === false) ||
    partnerType === TrustOnboardingSubmission.BusinessPartnerTypeEnum.GovernmentalInstitution
  );
}

export function hasCompletedFormalProof(
  submission: TrustOnboardingSubmission,
  documents: TrustOnboardingSubmissionDocumentListItem[]
): boolean {
  const hasDeclarationOfIntent = documents.some(
    doc => doc.type === TrustOnboardingSubmissionDocumentListItem.TypeEnum.TrustOnboardingDeclarationOfIntent
  );
  if (!hasDeclarationOfIntent) {
    return false;
  }

  if (!submissionRequiresAdditionalDocument(submission)) {
    return true;
  }

  return documents.some(doc => doc.type === TrustOnboardingSubmissionDocumentListItem.TypeEnum.TrustOnboardingOther);
}

export function fetchTrustOnboardingDocuments(
  documentsApi: TrustOnboardingDocumentsApi,
  submissionId: string
): Observable<TrustOnboardingSubmissionDocumentListItem[]> {
  return documentsApi
    .listAllDocumentsForTrustOnboarding({id: submissionId, size: 50, page: 0})
    .pipe(map(page => page.content ?? []));
}
