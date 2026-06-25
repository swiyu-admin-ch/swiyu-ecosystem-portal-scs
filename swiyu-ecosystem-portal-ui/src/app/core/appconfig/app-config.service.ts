import {Injectable, computed, inject, signal} from '@angular/core';
import {ObEPamsEnvironment} from '@oblique/oblique';
import {AuthConfig} from 'angular-oauth2-oidc';
import {catchError, firstValueFrom, of} from 'rxjs';
import {
  AppConfig,
  AppConfigApi,
  EnvironmentsConfig,
  EportalConfig,
  FeatureToggles,
  PamsEnvironment
} from '../../api/generated';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly appConfigApi = inject(AppConfigApi);

  private readonly appConfig = signal<AppConfig | undefined>(undefined);

  authConfig = computed((): AuthConfig => {
    const config = this.appConfig();
    return {
      requireHttps: config?.authConfig.requireHttps,
      responseType: config?.authConfig.responseType,
      clientId: config?.authConfig.clientId,
      scope: config?.authConfig.scope,
      issuer: config?.authConfig.issuer,
      redirectUri: `${window.location.origin}/ui`,
      silentRefreshRedirectUri: `${window.location.origin}/assets/auth/silent-refresh.html`,
      redirectUriAsPostLogoutRedirectUriFallback: true,
      preserveRequestedRoute: true,
      strictDiscoveryDocumentValidation: false
    };
  });

  pamsEnvironment = computed((): ObEPamsEnvironment | undefined => {
    const config = this.appConfig()?.eportalConfig;
    switch (config?.pamsEnvironment) {
      case PamsEnvironment.Dev:
        return ObEPamsEnvironment.DEV;
      case PamsEnvironment.Test:
        return ObEPamsEnvironment.TEST;
      case PamsEnvironment.Ref:
        return ObEPamsEnvironment.REF;
      case PamsEnvironment.Abn:
        return ObEPamsEnvironment.ABN;
      case PamsEnvironment.Prod:
        return ObEPamsEnvironment.PROD;
    }
    throw new Error(`Unsupported PAMS environment: ${config?.pamsEnvironment}. Could not initialize header widget`);
  });

  async loadAppConfig() {
    const config = await firstValueFrom(this.fetchAppConfig());
    this.appConfig.set(config);
  }

  get banner(): string | undefined {
    return this.appConfig()?.banner;
  }

  get eportalConfig(): EportalConfig | undefined {
    return this.appConfig()?.eportalConfig;
  }

  get portalUrl(): string | undefined {
    return this.appConfig()?.portalUrl;
  }

  get trustApiUrl(): string | undefined {
    return this.appConfig()?.trustApiUrl;
  }

  get identifierRegistryApiUrl(): string | undefined {
    return this.appConfig()?.identifierRegistryApiUrl;
  }

  get statusRegistryApiUrl(): string | undefined {
    return this.appConfig()?.statusRegistryApiUrl;
  }

  get apiGatewayAuthUrl(): string | undefined {
    return this.appConfig()?.apiGatewayAuthUrl;
  }

  get identifierRegistryUrl(): string | undefined {
    return this.appConfig()?.identifierRegistryUrl;
  }

  get maxBusinessPartnerPerCustomer(): number | undefined {
    return this.appConfig()?.maxBusinessPartnerPerCustomer;
  }

  get productLabel(): string | undefined {
    return this.appConfig()?.productLabel;
  }

  get productLabelColor(): string | undefined {
    return this.appConfig()?.productLabelColor;
  }

  get eportalUrl(): string | undefined {
    return this.appConfig()?.eportalUrl;
  }

  get tokenRefreshEnabled(): boolean {
    return this.appConfig()?.tokenRefreshEnabled ?? false;
  }

  get featureToggles(): FeatureToggles {
    return {
      EIDARTFE_1122: this.appConfig()?.featureToggles.EIDARTFE_1122 || false
    };
  }

  get environments(): EnvironmentsConfig | undefined {
    return this.appConfig()?.environments;
  }

  get isFunctionalityAutomaticApprovalEnabled(): boolean {
    return this.appConfig()?.functionalityConfig.automaticApprovalEnabled ?? false;
  }

  get isFunctionalityPaymentEnabled(): boolean {
    return this.appConfig()?.functionalityConfig.paymentEnabled ?? false;
  }

  get isFunctionalityAllowPartnerBaseOnboardingBusinessEnabled(): boolean {
    return this.appConfig()?.functionalityConfig.allowPartnerBaseOnboardingBusinessEnabled ?? false;
  }

  get isFunctionalityAllowPartnerBaseOnboardingIndividualEnabled(): boolean {
    return this.appConfig()?.functionalityConfig.allowPartnerBaseOnboardingIndividualEnabled ?? false;
  }

  get isFunctionalityAllowPartnerBaseOnboardingGovernmentalEnabled(): boolean {
    return this.appConfig()?.functionalityConfig.allowPartnerBaseOnboardingGovernmentalEnabled ?? false;
  }

  get isFunctionalityPrimaryEnvironmentEnabled(): boolean {
    return this.appConfig()?.functionalityConfig.primaryEnvironmentEnabled ?? true;
  }

  private fetchAppConfig() {
    return this.appConfigApi.getConfiguration().pipe(
      catchError(error => {
        console.error(`failed to load app config`, error);
        return of(undefined);
      })
    );
  }
}
