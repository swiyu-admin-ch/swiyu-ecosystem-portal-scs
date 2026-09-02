import {map, Observable, of} from 'rxjs';
import {ProofOfPossession, TrustOnboardingDocumentsApi, TrustOnboardingSubmission} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {
  fetchTrustOnboardingDocuments,
  hasCompletedFormalProof,
  hasSelectedDids
} from './trust-onboarding-step-requirements';

// Used where a synchronous route is required (e.g. an Angular `computed()` signal) and the
// document-upload state can't be checked without an async call. @see getLastValidTrustStepRoute$
export function getLastValidTrustStepRoute(submission: TrustOnboardingSubmission): string[] {
  const {status, proofOfPossessionList, partnerId, id: submissionId} = submission;

  if (
    status === TrustOnboardingSubmission.StatusEnum.Submitted ||
    status === TrustOnboardingSubmission.StatusEnum.Resubmitted ||
    status === TrustOnboardingSubmission.StatusEnum.Succeeded ||
    status === TrustOnboardingSubmission.StatusEnum.Rejected
  ) {
    return AppRoutes.trustOnboardingApproval(partnerId, submissionId);
  }

  // A request for additional information resets the wizard to the first step (EID-6376).
  if (status === TrustOnboardingSubmission.StatusEnum.InformationRequested) {
    return AppRoutes.trustOnboardingProfile(partnerId, submissionId);
  }

  if (hasSelectedDids(submission)) {
    if (proofOfPossessionList.some(pop => pop.status !== ProofOfPossession.StatusEnum.NotSupplied)) {
      return AppRoutes.trustOnboardingTechnicalProof(partnerId, submissionId);
    } else {
      // no technical proof has been supplied yet
      return AppRoutes.trustOnboardingDids(partnerId, submissionId);
    }
  }

  return AppRoutes.trustOnboardingProfile(partnerId, submissionId);
}

// Used by the trust-step route guards, where the document-upload state can be checked
// asynchronously to correctly distinguish the `formal-proof` and `technical-proof` steps.
export function getLastValidTrustStepRoute$(
  submission: TrustOnboardingSubmission,
  documentsApi: TrustOnboardingDocumentsApi
): Observable<string[]> {
  const {status, partnerId, id: submissionId} = submission;

  if (
    status === TrustOnboardingSubmission.StatusEnum.Submitted ||
    status === TrustOnboardingSubmission.StatusEnum.Resubmitted ||
    status === TrustOnboardingSubmission.StatusEnum.Succeeded ||
    status === TrustOnboardingSubmission.StatusEnum.Rejected
  ) {
    return of(AppRoutes.trustOnboardingApproval(partnerId, submissionId));
  }

  // A request for additional information resets the wizard to the first step (EID-6376).
  if (status === TrustOnboardingSubmission.StatusEnum.InformationRequested) {
    return of(AppRoutes.trustOnboardingProfile(partnerId, submissionId));
  }

  if (!hasSelectedDids(submission)) {
    return of(AppRoutes.trustOnboardingProfile(partnerId, submissionId));
  }

  return fetchTrustOnboardingDocuments(documentsApi, submissionId).pipe(
    map(documents =>
      hasCompletedFormalProof(submission, documents)
        ? AppRoutes.trustOnboardingTechnicalProof(partnerId, submissionId)
        : AppRoutes.trustOnboardingFormalProof(partnerId, submissionId)
    )
  );
}
