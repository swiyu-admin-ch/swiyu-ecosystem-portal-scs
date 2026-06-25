import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {BusinessPartnerApi} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AuthService} from '../../../../core/security/auth.service';

export const canActivateBaseStepWithoutPartner: CanActivateFn = () => {
  const router = inject(Router);
  // Allow in-app navigation (e.g. clicking Next on productselection).
  // Only redirect on direct URL access (reload/bookmark) where product selection data is lost.
  // router.navigated is false on the initial page load and true after any successful in-app navigation.
  if (router.navigated) {
    return true;
  }
  return router.createUrlTree(AppRoutes.baseOnboardingProductSelection());
};

export const canActivateBaseStepWithPartner: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const businessPartnerApi = inject(BusinessPartnerApi);
  const router = inject(Router);
  const authService = inject(AuthService);

  const partnerId = route.paramMap.get('partnerId');

  if (!partnerId) {
    return router.createUrlTree(AppRoutes.baseOnboardingProductSelection());
  }

  // The guard runs before auth. Don't fallback here, as it would override the return-url to productselection.
  if (!authService.isLoggedIn) {
    return true;
  }

  return businessPartnerApi.getBusinessPartner({businessPartnerId: partnerId}).pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(AppRoutes.baseOnboardingProductSelection()));
    })
  );
};
