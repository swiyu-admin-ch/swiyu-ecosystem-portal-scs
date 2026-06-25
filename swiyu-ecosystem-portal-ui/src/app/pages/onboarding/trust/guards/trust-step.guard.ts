import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {TrustOnboardingApi, TrustOnboardingSubmission} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AuthService} from '../../../../core/security/auth.service';
import {getLastValidTrustStepRoute} from '../../../../core/util/last-valid-trust-step-route';

export const canActivateTrustStep: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  return withTrustSubmission(route, (submission, partnerId, submissionId, router) => {
    if (submission.status !== TrustOnboardingSubmission.StatusEnum.Unsubmitted) {
      const approvalRoute = AppRoutes.trustOnboardingApproval(partnerId, submissionId);
      const currentStep = route.url[0]?.path;
      if (currentStep === approvalRoute[approvalRoute.length - 1]) {
        return true;
      }
      return router.createUrlTree(AppRoutes.trustOnboardingApproval(partnerId, submissionId));
    }
    return true;
  });
};

export const canActivateTrustBaseUrl: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  return withTrustSubmission(route, (submission, _partnerId, _submissionId, router) => {
    return router.createUrlTree(getLastValidTrustStepRoute(submission));
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
  ) => boolean | UrlTree
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
    map(submission => resolveTrustStepUrlFn(submission, partnerId, submissionId, router)),
    catchError(() => of(router.createUrlTree(AppRoutes.trustOnboardingIntroduction(partnerId))))
  );
}
