import {inject} from '@angular/core';
import {CanMatchFn, GuardResult, MaybeAsync, RedirectCommand, Route, Router, UrlTree} from '@angular/router';
import {FeatureToggles} from '../../api/generated';
import {AppConfigService} from '../appconfig/app-config.service';

/**
 * A guard that redirects to a specified path if a feature toggle is active.
 * The feature toggle to check is specified in the route's data property under the key 'guardFeature'.
 * The redirect path is specified in the route's data property under the key 'redirectTo'.
 *
 * If the feature toggle is active, the guard returns a `RedirectCommand` to the specified path,
 * preserving query parameters and fragment from the current URL.
 * If the feature toggle is not active, the guard allows access by returning `true`.
 *
 * @param route The route to check.
 * @returns `RedirectCommand` if the feature toggle is active, `true` otherwise.
 * @throws An error if the 'guardFeature' key or 'redirectTo' key is not present in the route's data.
 */
export const featureToggleRedirectGuard: CanMatchFn = (route: Route): MaybeAsync<GuardResult> => {
  const appConfigService = inject(AppConfigService);
  const router = inject(Router);
  if (route?.data) {
    const feature: keyof FeatureToggles = route?.data['guardFeature'];
    const redirectTo: string = route?.data['redirectTo'];
    if (appConfigService.featureToggles[feature]) {
      const targetUrlTree: UrlTree = router.parseUrl(redirectTo);
      const currentNavigation = router.currentNavigation();
      if (currentNavigation) {
        targetUrlTree.queryParams = currentNavigation.extractedUrl.queryParams;
        targetUrlTree.fragment = currentNavigation.extractedUrl.fragment;
      }
      return new RedirectCommand(targetUrlTree);
    }
    return true;
  }
  throw new Error('Feature toggle key or redirect path not present in route data');
};
