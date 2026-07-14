import {APP_BASE_HREF, registerLocaleData} from '@angular/common';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import localeDECH from '@angular/common/locales/de-CH';
import localeENCH from '@angular/common/locales/en';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import {ApplicationConfig, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideTranslateCompiler} from '@ngx-translate/core';
import {
  OB_BANNER,
  OB_PAMS_CONFIGURATION,
  ObEPamsEnvironment,
  ObHttpApiInterceptor,
  provideObliqueConfiguration
} from '@oblique/oblique';
import {provideOAuthClient} from 'angular-oauth2-oidc';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';
import {BASE_PATH, Configuration, provideApi} from './app/api/generated';
import {AppComponent} from './app/app.component';
import {routes} from './app/app.routes';
import {AppConfigService} from './app/core/appconfig/app-config.service';
import {appInitializer} from './app/core/appconfig/app-initializer.service';
import {errorHttpInterceptor} from './app/core/interceptor/error-http-interceptor';

registerLocaleData(localeDECH);
registerLocaleData(localeFRCH);
registerLocaleData(localeITCH);
registerLocaleData(localeENCH);

const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => appInitializer()),
    {
      provide: OB_BANNER,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService): object => {
        return {text: appConfigService.banner};
      }
    },
    {
      provide: OB_PAMS_CONFIGURATION,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        // result is a ObIPamsConfiguration, but it is not exported from the lib, so we cannot be type safe
        // To use the pams on localhost please refer to the readme
        if (globalThis.location.hostname == 'localhost') {
          return {
            environment: appConfigService.pamsEnvironment(),
            rootUrl: 'http://localhost:8207/'
          };
        } else if (appConfigService.pamsEnvironment() === ObEPamsEnvironment.DEV) {
          return {
            environment: appConfigService.pamsEnvironment(),
            // hardcoded since it's just for DEV
            rootUrl: 'https://swiyu-oauth-mock-server-d.apps.p-szb-ros-shrd-npr-01.cloud.admin.ch'
          };
        } else {
          return {
            environment: appConfigService.pamsEnvironment()
          };
        }
      }
    },
    {provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true},
    {provide: APP_BASE_HREF, useValue: '/ui'},
    {provide: BASE_PATH, useValue: ''},
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withComponentInputBinding()),
    provideApi(new Configuration({})),
    provideHttpClient(withInterceptors([errorHttpInterceptor]), withInterceptorsFromDi()),
    provideObliqueConfiguration({
      translate: {
        config: {
          compiler: provideTranslateCompiler(TranslateMessageFormatCompiler)
        }
      },
      accessibilityStatement: {
        applicationName: 'swiyu Service Portal',
        createdOn: new Date('2025-10-29'),
        conformity: 'full',
        applicationOperator:
          'Replace me with the name and address of the federal office that exploit this application, HTML is permitted',
        contact: [{/* at least 1 email or phone number has to be provided */ email: ''}]
      }
    }),
    provideOAuthClient({
      resourceServer: {
        allowedUrls: ['/api'],
        sendAccessToken: true
      }
    })
  ]
};

bootstrapApplication(AppComponent, appConfig).catch(e => console.error(e));
