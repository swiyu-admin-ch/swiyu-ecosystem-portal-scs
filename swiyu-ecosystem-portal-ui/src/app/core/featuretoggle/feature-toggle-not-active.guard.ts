import {inject} from '@angular/core';
import {CanMatchFn, GuardResult, MaybeAsync, Route} from '@angular/router';
import {FeatureToggles} from '../../api/generated';
import {AppConfigService} from '../appconfig/app-config.service';

export const featureToggleNotActiveGuard: CanMatchFn = (route: Route): MaybeAsync<GuardResult> => {
  const appConfigService = inject(AppConfigService);
  if (route?.data) {
    const feature: keyof FeatureToggles = route?.data['guardFeature'];
    // need to check for strick sameness otherwise unknown feature flags would return true
    // noinspection PointlessBooleanExpressionJS
    return appConfigService.featureToggles[feature] !== true;
  }
  throw new Error('Feature toggle key not present in route data');
};
