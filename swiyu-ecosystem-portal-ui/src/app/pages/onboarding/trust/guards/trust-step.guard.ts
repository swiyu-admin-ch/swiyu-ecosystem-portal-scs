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
    const currentStep = route.url[0]?.path;

    // A submission can only be edited while it is UNSUBMITTED or in the adjustment state
    // INFORMATION_REQUESTED (EID-6376). RESUBMITTED behaves like SUBMITTED (locked) and
    // therefore redirects to the approval route. All other states also redirect there.
    const isEditable =
      submission.status === TrustOnboardingSubmission.StatusEnum.Unsubmitted ||
      submission.status === TrustOnboardingSubmission.StatusEnum.InformationRequested;

    if (!isEditable) {
      const approvalRoute = AppRoutes.trustOnboardingWizardStepApproval(partnerId, submissionId);

      if (currentStep === approvalRoute[approvalRoute.length - 1]) {
        logTrustGuardDecision('allow current step because submission is locked and already on approval', {
          currentStep,
          partnerId,
          submissionId,
          status: submission.status
        });
        return true;
      }

      logTrustGuardDecision('redirect to approval because submission is not editable', {
        currentStep,
        partnerId,
        submissionId,
        status: submission.status,
        redirectTo: approvalRoute.join('/')
      });
      return router.createUrlTree(AppRoutes.trustOnboardingWizardStepApproval(partnerId, submissionId));
    }

    logTrustGuardDecision('submission is editable', {
      currentStep,
      partnerId,
      submissionId,
      status: submission.status
    });

    if (currentStep === 'formal-proof') {
      if (!hasSelectedDids(submission)) {
        logTrustGuardDecision('redirect formal-proof to dids because no DIDs are selected', {
          currentStep,
          partnerId,
          submissionId,
          status: submission.status
        });
        return router.createUrlTree(AppRoutes.trustOnboardingWizardStepDids(partnerId, submissionId));
      }

      logTrustGuardDecision('allow formal-proof because DIDs are selected', {
        currentStep,
        partnerId,
        submissionId,
        status: submission.status
      });
      return true;
    }

    if (currentStep === 'technical-proof' || currentStep === 'approval') {
      if (!hasSelectedDids(submission)) {
        logTrustGuardDecision(`redirect ${currentStep} to dids because no DIDs are selected`, {
          currentStep,
          partnerId,
          submissionId,
          status: submission.status
        });
        return router.createUrlTree(AppRoutes.trustOnboardingWizardStepDids(partnerId, submissionId));
      }

      logTrustGuardDecision(`check formal proof before allowing ${currentStep}`, {
        currentStep,
        partnerId,
        submissionId,
        status: submission.status
      });

      return fetchTrustOnboardingDocuments(documentsApi, submissionId).pipe(
        map(documents => {
          const hasFormalProof = hasCompletedFormalProof(submission, documents);

          logTrustGuardDecision(
            hasFormalProof
              ? `allow ${currentStep} because formal proof is complete`
              : `redirect ${currentStep} to formal-proof because formal proof is incomplete`,
            {
              currentStep,
              partnerId,
              submissionId,
              status: submission.status,
              documentCount: documents.length,
              hasFormalProof
            }
          );

          return hasFormalProof
            ? true
            : router.createUrlTree(AppRoutes.trustOnboardingWizardStepFormalProof(partnerId, submissionId));
        })
      );
    }

    logTrustGuardDecision('allow step because no guard restriction applied', {
      currentStep,
      partnerId,
      submissionId,
      status: submission.status
    });

    return true;
  });
};

export const canActivateTrustBaseUrl: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const documentsApi = inject(TrustOnboardingDocumentsApi);

  return withTrustSubmission(route, (submission, _partnerId, _submissionId, router) => {
    return getLastValidTrustStepRoute$(submission, documentsApi).pipe(
      map(targetRoute => {
        logTrustGuardDecision('redirect base trust onboarding URL to last valid step', {
          status: submission.status,
          redirectTo: targetRoute.join('/')
        });
        return router.createUrlTree(targetRoute);
      })
    );
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
    logTrustGuardDecision('redirect to introduction because route params are missing', {
      partnerId,
      submissionId,
      routeUrl: route.url.map(segment => segment.path).join('/')
    });
    return router.createUrlTree(AppRoutes.baseOnboardingIntroduction());
  }

  // The guard runs before auth. Don't fallback here, as it would override the return-url to introduction.
  if (!authService.isLoggedIn) {
    logTrustGuardDecision('allow navigation because authentication is not established yet', {
      partnerId,
      submissionId,
      routeUrl: route.url.map(segment => segment.path).join('/')
    });
    return true;
  }

  return trustOnboardingApi.getTrustOnboardingSubmission({id: submissionId}).pipe(
    switchMap((submission: TrustOnboardingSubmission) => {
      logTrustGuardDecision('submission loaded for trust guard evaluation', {
        partnerId,
        submissionId,
        routeUrl: route.url.map(segment => segment.path).join('/'),
        status: submission.status
      });
      const result = resolveTrustStepUrlFn(submission, partnerId, submissionId, router);
      return result instanceof Observable ? result : of(result);
    }),
    catchError(() => {
      logTrustGuardDecision('redirect to trust onboarding introduction because submission loading failed', {
        partnerId,
        submissionId,
        routeUrl: route.url.map(segment => segment.path).join('/')
      });
      return of(router.createUrlTree(AppRoutes.trustOnboardingIntroduction(partnerId)));
    })
  );
}

function logTrustGuardDecision(message: string, details?: Record<string, unknown>): void {
  console.log(`[TrustStepGuard] ${message}`, details ?? {});
}
