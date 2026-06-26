import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, convertToParamMap, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {TrustOnboardingApi, TrustOnboardingSubmission} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AuthService} from '../../../../core/security/auth.service';
import {canActivateTrustBaseUrl, canActivateTrustStep} from './trust-step.guard';

describe('trust-step guards', () => {
  let mockRouter: {createUrlTree: jest.Mock};
  let mockTrustOnboardingApi: {getTrustOnboardingSubmission: jest.Mock};
  let mockAuthService: {isLoggedIn: boolean};

  const PARTNER_ID = 'partner-123';
  const SUBMISSION_ID = 'sub-456';

  function createSubmission(overrides: Partial<TrustOnboardingSubmission> = {}): TrustOnboardingSubmission {
    return {
      id: SUBMISSION_ID,
      version: 1,
      partnerId: PARTNER_ID,
      entityName: {default: 'Test', 'de-CH': 'Test'},
      entityEmail: 'test@test.com',
      entityAddress: {street: 's', city: 'c', postalCode: '1234', country: 'CH'},
      contactPerson: {firstName: 'F', lastName: 'L', phone: '123', email: 'f@l.com'},
      status: TrustOnboardingSubmission.StatusEnum.Unsubmitted,
      proofOfPossessionList: [],
      registryIds: {},
      ...overrides
    };
  }

  function createRouteWithParent(stepPath: string): ActivatedRouteSnapshot {
    return {
      paramMap: convertToParamMap({}),
      url: [{path: stepPath}],
      parent: {
        paramMap: convertToParamMap({partnerId: PARTNER_ID, submissionId: SUBMISSION_ID})
      }
    } as unknown as ActivatedRouteSnapshot;
  }

  function createRouteWithoutParams(): ActivatedRouteSnapshot {
    return {
      paramMap: convertToParamMap({}),
      url: [],
      parent: {
        paramMap: convertToParamMap({})
      }
    } as unknown as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jest.fn((commands: string[]) => commands as unknown as UrlTree)
    };
    mockTrustOnboardingApi = {
      getTrustOnboardingSubmission: jest.fn()
    };
    mockAuthService = {
      isLoggedIn: true
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: TrustOnboardingApi, useValue: mockTrustOnboardingApi},
        {provide: AuthService, useValue: mockAuthService}
      ]
    });
  });

  describe('canActivateTrustStep', () => {
    function runGuard(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | UrlTree {
      return TestBed.runInInjectionContext(() => canActivateTrustStep(route, {} as RouterStateSnapshot)) as
        | Observable<boolean | UrlTree>
        | UrlTree;
    }

    it('should redirect to base onboarding when params are missing', () => {
      const route = createRouteWithoutParams();
      runGuard(route);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.baseOnboardingIntroduction());
    });

    it('should allow navigation when submission is unsubmitted', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Unsubmitted});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('profile');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });

    it('should redirect to approval when submission is submitted and current step is not approval', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Submitted});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('profile');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
          AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
        );
        done();
      });
    });

    it('should allow navigation when submission is submitted and current step is already approval', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Submitted});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('approval');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });

    it('should redirect to approval for succeeded status', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Succeeded});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('dids');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
          AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
        );
        done();
      });
    });

    it('should redirect to approval for rejected status', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Rejected});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('formal-proof');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
          AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
        );
        done();
      });
    });

    it('should redirect to introduction on API error', done => {
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(throwError(() => new Error('fail')));
      const route = createRouteWithParent('profile');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.trustOnboardingIntroduction(PARTNER_ID));
        done();
      });
    });

    it('should allow navigation when not logged in yet', () => {
      mockAuthService.isLoggedIn = false;
      const route = createRouteWithParent('profile');

      const result = runGuard(route);
      expect(result).toBe(true);
      expect(mockTrustOnboardingApi.getTrustOnboardingSubmission).not.toHaveBeenCalled();
    });
  });

  describe('canActivateTrustBaseUrl', () => {
    function runGuard(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | UrlTree {
      return TestBed.runInInjectionContext(() => canActivateTrustBaseUrl(route, {} as RouterStateSnapshot)) as
        | Observable<boolean | UrlTree>
        | UrlTree;
    }

    it('should redirect to base onboarding when params are missing', () => {
      const route = createRouteWithoutParams();
      runGuard(route);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.baseOnboardingIntroduction());
    });

    it('should redirect to profile for unsubmitted submission with no data', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Unsubmitted});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
          AppRoutes.trustOnboardingProfile(PARTNER_ID, SUBMISSION_ID)
        );
        done();
      });
    });

    it('should redirect to approval for submitted submission', done => {
      const submission = createSubmission({status: TrustOnboardingSubmission.StatusEnum.Submitted});
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(of(submission));
      const route = createRouteWithParent('');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
          AppRoutes.trustOnboardingApproval(PARTNER_ID, SUBMISSION_ID)
        );
        done();
      });
    });

    it('should redirect to introduction on API error', done => {
      mockTrustOnboardingApi.getTrustOnboardingSubmission.mockReturnValue(throwError(() => new Error('fail')));
      const route = createRouteWithParent('');

      (runGuard(route) as Observable<boolean | UrlTree>).subscribe(() => {
        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(AppRoutes.trustOnboardingIntroduction(PARTNER_ID));
        done();
      });
    });

    it('should allow navigation when not logged in yet', () => {
      mockAuthService.isLoggedIn = false;
      const route = createRouteWithParent('');

      const result = runGuard(route);
      expect(result).toBe(true);
      expect(mockTrustOnboardingApi.getTrustOnboardingSubmission).not.toHaveBeenCalled();
    });
  });
});
