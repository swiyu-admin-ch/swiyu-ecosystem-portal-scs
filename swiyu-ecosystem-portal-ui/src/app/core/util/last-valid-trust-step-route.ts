import {ProofOfPossession, TrustOnboardingSubmission} from '../../api/generated';
import {AppRoutes} from '../../app.routes';

export function getLastValidTrustStepRoute(submission: TrustOnboardingSubmission): string[] {
  const {status, proofOfPossessionList, partnerId, id: submissionId} = submission;

  if (
    status === TrustOnboardingSubmission.StatusEnum.Submitted ||
    status === TrustOnboardingSubmission.StatusEnum.Succeeded ||
    status === TrustOnboardingSubmission.StatusEnum.Rejected
  ) {
    return AppRoutes.trustOnboardingApproval(partnerId, submissionId);
  }

  if (proofOfPossessionList && proofOfPossessionList.length > 0) {
    if (proofOfPossessionList.some(pop => pop.status !== ProofOfPossession.StatusEnum.NotSupplied)) {
      return AppRoutes.trustOnboardingTechnicalProof(partnerId, submissionId);
    } else {
      // no technical proof has been supplied yet
      return AppRoutes.trustOnboardingDids(partnerId, submissionId);
    }
  }

  return AppRoutes.trustOnboardingProfile(partnerId, submissionId);
}
