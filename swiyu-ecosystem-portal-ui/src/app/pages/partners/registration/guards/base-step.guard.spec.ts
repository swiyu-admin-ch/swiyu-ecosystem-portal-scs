import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, convertToParamMap, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {BusinessPartnerApi} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AuthService} from '../../../../core/security/auth.service';
import {canActivateBaseStepWithoutPartner, canActivateBaseStepWithPartner} from './base-step.guard';

describe('base-step guards', () => {
  let mockRouter: {navigated: boolean; createUrlTree: jest.Mock};
  let mockBusinessPartnerApi: {getBusinessPartner: jest.Mock};
  let mockAuthService: {isLoggedIn: boolean};

  beforeEach(() => {
    mockRouter = {
      navigated: false,
      createUrlTree: jest.fn((commands: string[]) => commands as unknown as UrlTree)
    };
    mockBusinessPartnerApi = {
      getBusinessPartner: jest.fn()
    };
    mockAuthService = {
      isLoggedIn: true
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: BusinessPartnerApi, useValue: mockBusinessPartnerApi},
        {provide: AuthService, useValue: mockAuthService}
      ]
    });
  });

  describe('canActivateBaseStepWithoutPartner', () => {
    function runGuard() {
      return TestBed.runInInjectionContext(() =>
        canActivateBaseStepWithoutPartner({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );
    }

    it('should allow navigation when router.navigated is true (in-app navigation)', () => {
      mockRouter.navigated = true;

      const result = runGuard();
      expect(result).toBe(true);
    });

    it('should redirect to product selection on direct URL access (router.navigated is false)', () => {
      mockRouter.navigated = false;

      runGuard();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.baseOnboardingProductSelection());
    });
  });

  describe('canActivateBaseStepWithPartner', () => {
    function createRoute(partnerId: string | null): ActivatedRouteSnapshot {
      return {
        paramMap: convertToParamMap(partnerId ? {partnerId} : {})
      } as unknown as ActivatedRouteSnapshot;
    }

    function runGuard(route: ActivatedRouteSnapshot) {
      return TestBed.runInInjectionContext(() => canActivateBaseStepWithPartner(route, {} as RouterStateSnapshot)) as
        | UrlTree
        | Observable<boolean | UrlTree>;
    }

    it('should redirect to product selection when partnerId is missing', () => {
      const route = createRoute(null);
      runGuard(route);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.baseOnboardingProductSelection());
    });

    it('should allow navigation when partner exists', done => {
      mockBusinessPartnerApi.getBusinessPartner.mockReturnValue(of({id: 'partner-1'}));
      const route = createRoute('partner-1');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(value => {
        expect(value).toBe(true);
        expect(mockBusinessPartnerApi.getBusinessPartner).toHaveBeenCalledWith({businessPartnerId: 'partner-1'});
        done();
      });
    });

    it('should allow navigation when not logged in yet', () => {
      mockAuthService.isLoggedIn = false;
      const route = createRoute('partner-1');

      const result = runGuard(route);
      expect(result).toBe(true);
      expect(mockBusinessPartnerApi.getBusinessPartner).not.toHaveBeenCalled();
    });

    it('should redirect to product selection when API call fails', done => {
      mockBusinessPartnerApi.getBusinessPartner.mockReturnValue(throwError(() => new Error('Not found')));
      const route = createRoute('partner-1');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.baseOnboardingProductSelection());
        done();
      });
    });
  });
});
