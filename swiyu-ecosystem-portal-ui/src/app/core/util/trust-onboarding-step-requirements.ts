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
function requiresAdditionalDocument(submission: TrustOnboardingSubmission): boolean {
  return (
    (submission.businessPartnerType === TrustOnboardingSubmission.BusinessPartnerTypeEnum.Business &&
      submission.isRegisteredInCommercialRegister === false) ||
    submission.businessPartnerType === TrustOnboardingSubmission.BusinessPartnerTypeEnum.GovernmentalInstitution
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

  if (!requiresAdditionalDocument(submission)) {
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
