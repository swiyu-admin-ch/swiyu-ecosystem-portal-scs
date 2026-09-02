import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree} from '@angular/router';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {TrustOnboardingApi, TrustOnboardingDocumentsApi, TrustOnboardingSubmission} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AuthService} from '../../../../core/security/auth.service';
import {getLastValidTrustStepRoute$} from '../../../../core/util/last-valid-trust-step-route';
import {
  fetchTrustOnboardingDocuments,
  hasCompletedFormalProof,
  hasSelectedDids
} from '../../../../core/util/trust-onboarding-step-requirements';

export const canActivateTrustStep: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const documentsApi = inject(TrustOnboardingDocumentsApi);

  return withTrustSubmission(route, (submission, partnerId, submissionId, router) => {
    // A submission can only be edited while it is UNSUBMITTED or in the adjustment state
    // INFORMATION_REQUESTED (EID-6376). RESUBMITTED behaves like SUBMITTED (locked) and
    // therefore redirects to the approval route. All other states also redirect there.
    const isEditable =
      submission.status === TrustOnboardingSubmission.StatusEnum.Unsubmitted ||
      submission.status === TrustOnboardingSubmission.StatusEnum.InformationRequested;
    if (!isEditable) {
      const approvalRoute = AppRoutes.trustOnboardingApproval(partnerId, submissionId);
      const currentStep = route.url[0]?.path;
      if (currentStep === approvalRoute[approvalRoute.length - 1]) {
        return true;
      }
      return router.createUrlTree(AppRoutes.trustOnboardingApproval(partnerId, submissionId));
    }

    const currentStep = route.url[0]?.path;

    if (currentStep === 'formal-proof') {
      if (!hasSelectedDids(submission)) {
        return router.createUrlTree(AppRoutes.trustOnboardingDids(partnerId, submissionId));
      }
      return true;
    }

    if (currentStep === 'technical-proof' || currentStep === 'approval') {
      if (!hasSelectedDids(submission)) {
        return router.createUrlTree(AppRoutes.trustOnboardingDids(partnerId, submissionId));
      }
      return fetchTrustOnboardingDocuments(documentsApi, submissionId).pipe(
        map(documents =>
          hasCompletedFormalProof(submission, documents)
            ? true
            : router.createUrlTree(AppRoutes.trustOnboardingFormalProof(partnerId, submissionId))
        )
      );
    }

    return true;
  });
};

export const canActivateTrustBaseUrl: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const documentsApi = inject(TrustOnboardingDocumentsApi);

  return withTrustSubmission(route, (submission, _partnerId, _submissionId, router) => {
    return getLastValidTrustStepRoute$(submission, documentsApi).pipe(map(route => router.createUrlTree(route)));
  });
};

function getRouteParams(route: ActivatedRouteSnapshot): {submissionId: string | null; partnerId: string | null} {
  return {
    submissionId: route.parent?.paramMap.get('submissionId') ?? route.paramMap.get('submissionId'),
    partnerId: route.parent?.paramMap.get('partnerId') ?? route.paramMap.get('partnerId')
  };
}

function withTrustSubmission(
  route: ActivatedRouteSnapshot,
  resolveTrustStepUrlFn: (
    submission: TrustOnboardingSubmission,
    partnerId: string,
    submissionId: string,
    router: Router
  ) => boolean | UrlTree | Observable<boolean | UrlTree>
): Observable<boolean | UrlTree> | boolean | UrlTree {
  const trustOnboardingApi = inject(TrustOnboardingApi);
  const router = inject(Router);
  const authService = inject(AuthService);

  const {submissionId, partnerId} = getRouteParams(route);

  if (!submissionId || !partnerId) {
    return router.createUrlTree(AppRoutes.baseOnboardingIntroduction());
  }

  // The guard runs before auth. Don't fallback here, as it would override the return-url to introduction.
  if (!authService.isLoggedIn) {
    return true;
  }

  return trustOnboardingApi.getTrustOnboardingSubmission({id: submissionId}).pipe(
    switchMap((submission: TrustOnboardingSubmission) => {
      const result = resolveTrustStepUrlFn(submission, partnerId, submissionId, router);
      return result instanceof Observable ? result : of(result);
    }),
    catchError(() => of(router.createUrlTree(AppRoutes.trustOnboardingIntroduction(partnerId))))
  );
}
