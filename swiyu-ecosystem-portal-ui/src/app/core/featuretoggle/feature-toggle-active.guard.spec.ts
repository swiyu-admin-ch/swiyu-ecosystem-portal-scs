import {TestBed} from '@angular/core/testing';
import {CanMatchFn, Route} from '@angular/router';
import {AppConfigService} from '../appconfig/app-config.service';
import {featureToggleActiveGuard} from './feature-toggle-active.guard';

describe('featureToggleActiveGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => featureToggleActiveGuard(...guardParameters));

  let appConfigServiceMock: {featureToggles: Record<string, boolean>};

  beforeEach(() => {
    appConfigServiceMock = {
      featureToggles: {}
    };

    TestBed.configureTestingModule({
      providers: [{provide: AppConfigService, useValue: appConfigServiceMock}]
    });
  });

  it('should return true if the feature toggle is active', () => {
    appConfigServiceMock.featureToggles['testFeature'] = true;
    const route: Route = {
      data: {
        guardFeature: 'testFeature'
      }
    };

    const guardResult = executeGuard(route, []);
    expect(guardResult).toBe(true);
  });

  it('should return false if the feature toggle is not active', () => {
    appConfigServiceMock.featureToggles['testFeature'] = false;
    const route: Route = {
      data: {
        guardFeature: 'testFeature'
      }
    };

    const guardResult = executeGuard(route, []);
    expect(guardResult).toBe(false);
  });

  it('should return false if the feature toggle is not defined', () => {
    const route: Route = {
      data: {
        guardFeature: 'anotherFeature'
      }
    };

    const guardResult = executeGuard(route, []);
    expect(guardResult).toBe(false);
  });
});
