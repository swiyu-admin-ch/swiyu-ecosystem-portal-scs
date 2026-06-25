import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Router} from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';
import {NEVER} from 'rxjs';
import {AuthService} from './auth.service';

describe('AuthService', () => {
  let oauthServiceMock: {
    events: typeof NEVER;
    configure: jest.Mock;
    loadDiscoveryDocumentAndTryLogin: jest.Mock;
    setupAutomaticSilentRefresh: jest.Mock;
    initLoginFlow: jest.Mock;
    hasValidAccessToken: jest.Mock;
    state: string;
  };
  let routerNavigateByUrlMock: jest.Mock;
  let routerUrl: string;

  beforeEach(() => {
    routerUrl = '/ui/business-partners/partner-1/identifier/id-1';
    oauthServiceMock = {
      events: NEVER,
      configure: jest.fn(),
      loadDiscoveryDocumentAndTryLogin: jest.fn().mockResolvedValue(true),
      setupAutomaticSilentRefresh: jest.fn(),
      initLoginFlow: jest.fn(),
      hasValidAccessToken: jest.fn(),
      state: ''
    };
    routerNavigateByUrlMock = jest.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {provide: OAuthService, useValue: oauthServiceMock},
        {
          provide: Router,
          useValue: {
            navigateByUrl: routerNavigateByUrlMock,
            get url() {
              return routerUrl;
            }
          }
        }
      ]
    });
  });

  it('startLoginFlowWithReturnUrl stores session url and starts login without extra state', () => {
    const auth = TestBed.inject(AuthService);
    auth.startLoginFlowWithReturnUrl('/ui/next');
    expect(oauthServiceMock.initLoginFlow).toHaveBeenCalled();
  });

  it('configureFlow navigates when logged in with stored post-login url', fakeAsync(() => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(true);
    oauthServiceMock.state = encodeURIComponent('/ui/onboarding/base/register/x/payment');

    TestBed.inject(AuthService).configureFlow({issuer: 'https://idp'} as never, false);
    tick();

    expect(routerNavigateByUrlMock).toHaveBeenCalledWith('/ui/onboarding/base/register/x/payment');
    expect(oauthServiceMock.initLoginFlow).not.toHaveBeenCalled();
  }));

  it('configureFlow opens login when there is no token', fakeAsync(() => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(false);

    TestBed.inject(AuthService).configureFlow({issuer: 'https://idp'} as never, false);
    tick();

    expect(oauthServiceMock.initLoginFlow).toHaveBeenCalledWith('/ui/business-partners/partner-1/identifier/id-1');
    expect(routerNavigateByUrlMock).not.toHaveBeenCalled();
  }));
});
