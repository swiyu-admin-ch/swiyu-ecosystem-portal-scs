import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {AuthConfig, OAuthService} from 'angular-oauth2-oidc';
import {BehaviorSubject, from, Observable, tap} from 'rxjs';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly oauthService = inject(OAuthService);
  private readonly router = inject(Router);
  private readonly useDiscoveryDocument = true;
  public readonly loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.oauthService.events.subscribe(() => {
      const loggedInOld = this.loggedIn$.getValue();
      const loggedIn = this.oauthService.hasValidAccessToken();
      if (loggedIn !== loggedInOld) {
        this.loggedIn$.next(loggedIn);
      }
    });
  }

  configureFlow(authConfig: AuthConfig, tokenRefreshEnabled: boolean) {
    return this.configureOidc(authConfig, tokenRefreshEnabled)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (!this.oauthService.hasValidAccessToken()) {
          this.startLoginFlowWithReturnUrl(this.router.url);
          return;
        }

        const targetUrl = this.oauthService.state;
        if (targetUrl) {
          void this.router.navigateByUrl(decodeURIComponent(targetUrl));
        }
      });
  }

  startLoginFlowWithReturnUrl(returnUrl: string): void {
    this.oauthService.initLoginFlow(returnUrl);
  }

  refreshToken(): Observable<object> {
    return from(this.oauthService.silentRefresh());
  }

  get isLoggedIn() {
    return this.oauthService.hasValidAccessToken();
  }

  private configureOidc(authConfig: AuthConfig | undefined, tokenRefreshEnabled: boolean): Observable<boolean> {
    if (!authConfig) {
      throw new Error(
        'Failed to configure authentication due to missing authConfig. Did the backend return a valid config?'
      );
    }
    this.oauthService.configure(authConfig);
    const configurationResult: Observable<boolean> = this.useDiscoveryDocument
      ? from(this.oauthService.loadDiscoveryDocumentAndTryLogin())
      : from(this.oauthService.tryLogin());

    return configurationResult.pipe(tap(() => this.setupAutomaticSilentRefreshIfConfigured(tokenRefreshEnabled)));
  }

  private setupAutomaticSilentRefreshIfConfigured(tokenRefreshEnabled: boolean): void {
    if (tokenRefreshEnabled) {
      this.oauthService.setupAutomaticSilentRefresh();
    }
  }
}
