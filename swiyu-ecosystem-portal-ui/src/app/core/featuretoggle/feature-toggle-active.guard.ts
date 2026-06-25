import {inject} from '@angular/core';
import {CanMatchFn, GuardResult, MaybeAsync, Route} from '@angular/router';
import {FeatureToggles} from '../../api/generated';
import {AppConfigService} from '../appconfig/app-config.service';

/**
 * A guard that checks if a feature toggle is active.
 * The feature toggle to check is specified in the route's data property under the key 'guardFeature'.
 *
 * @param route The route to check.
 * @returns `true` if the feature toggle is active, `false` otherwise.
 * @throws An error if the 'guardFeature' key is not present in the route's data.
 */
export const featureToggleActiveGuard: CanMatchFn = (route: Route): MaybeAsync<GuardResult> => {
  const appConfigService = inject(AppConfigService);
  if (route?.data) {
    const feature: keyof FeatureToggles = route?.data['guardFeature'];
    // need to check for strick sameness otherwise unknown feature flags would return true
    // noinspection PointlessBooleanExpressionJS
    return appConfigService.featureToggles[feature] === true;
  }
  throw new Error('Feature toggle key not present in route data');
};
