import {NgStyle} from '@angular/common';
import {Component, HostListener, inject, OnInit} from '@angular/core';
import {MatChip} from '@angular/material/chips';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {UntilDestroy} from '@ngneat/until-destroy';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  ObDocumentMetaService,
  ObHttpApiInterceptorConfig,
  ObIServiceNavigationLink,
  ObMasterLayoutConfig,
  ObMasterLayoutHeaderService,
  ObMasterLayoutModule,
  WINDOW
} from '@oblique/oblique';
import {filter, map, mergeMap, of} from 'rxjs';
import {AppConfigService} from './core/appconfig/app-config.service';
import {I18nKeyDisplayService} from './core/i18n/i18n-key-display.service';
import {AuthService} from './core/security/auth.service';
import {UserProfileService} from './core/user/user-profile.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [TranslateModule, ObMasterLayoutModule, MatChip, NgStyle]
})
export class AppComponent implements OnInit {
  private readonly config = inject(ObMasterLayoutConfig);
  private readonly headerService = inject(ObMasterLayoutHeaderService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly authService = inject(AuthService);
  private readonly lang = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly obInterceptorConfig = inject(ObHttpApiInterceptorConfig);
  private readonly obDocumentMetaService = inject(ObDocumentMetaService);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly window = inject(WINDOW);
  readonly i18nKeyDisplay = inject(I18nKeyDisplayService);

  constructor() {
    // `errorHttpInterceptor` is used to send notifications when API calls fail.
    this.obInterceptorConfig.api.notification.active = false;

    // do not remove this logging until we have the 1st real use case to use
    // the profile in gov unboarding (otherwise UserProfileService gets tree shaken)
    this.userProfileService.userProfile$.subscribe(userProfile => {
      console.log(`current user is governmental: ${userProfile?.isGovernmental}`);
    });

    this.obDocumentMetaService.titleSuffix = 'app_name';

    this.addCustomIcon();
    this.translateSetup();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get productLabel() {
    return this.appConfigService.productLabel ?? '';
  }

  get productLabelColor() {
    return this.appConfigService.productLabelColor ?? '#1e5a55';
  }

  ngOnInit(): void {
    this.config.layout.hasMaxWidth = true;
    this.configureServiceNavigation();
    this.authService.configureFlow(this.appConfigService.authConfig(), this.appConfigService.tokenRefreshEnabled);
    this.config.header.serviceNavigation.infoLinks = [
      {
        url: this.lang.instant('eportal_global_btn_FAQ_url'),
        label: this.lang.instant('app_serviceNav_help_helpAndAnswers')
      },
      {
        url: 'https://swiyu-admin-ch.github.io/',
        label: this.lang.instant('app_serviceNav_help_technicalInformation')
      },
      {
        url: this.lang.instant('app_serviceNav_help_legal_link'),
        label: this.lang.instant('app_serviceNav_help_legal')
      },
      {
        url: this.lang.instant('app_serviceNav_help_additionalInformation_link'),
        label: this.lang.instant('app_serviceNav_help_additionalInformation')
      },
      {
        url: 'https://github.com/orgs/swiyu-admin-ch/discussions',
        label: this.lang.instant('app_serviceNav_help_github_discussions')
      },
      {
        url: this.lang.instant('app_serviceNav_help_feedback_link'),
        label: this.lang.instant('app_serviceNav_help_feedback')
      }
    ] as ObIServiceNavigationLink[];

    // Redirect when invalid language query param is present
    this.route.queryParams
      .pipe(
        filter(params => params['lang']),
        map(param => param['lang'] as string),
        mergeMap(params => {
          if (!this.lang.getLangs().includes(params)) {
            // Navigate to the same URL without the invalid language query param
            return this.router.navigate(this.router.url.split('?')[0].split('/'));
          }
          return of();
        })
      )
      .subscribe();
  }

  private translateSetup() {
    this.lang.instant('app_route_title_business_partner_detail');
    this.lang.instant('eportal_accessibility_step_prefix');
    // Translated label for test environment
    this.lang.instant('eportal_global_product_label_testenvironment');
  }

  private configureServiceNavigation(): void {
    const serviceNavigation = this.headerService.serviceNavigationConfiguration;
    serviceNavigation.displayInfo = true;
    serviceNavigation.displayLanguages = true;
    serviceNavigation.displayMessage = true;
    serviceNavigation.displayApplications = true;
    serviceNavigation.displayAuthentication = true;
    serviceNavigation.displayProfile = true;
    serviceNavigation.profileLinks = [];
    serviceNavigation.pamsAppId = this.appConfigService.eportalConfig?.pamsAppId;
    serviceNavigation.returnUrl = this.window.location.href;
    serviceNavigation.infoContact = {
      email: this.appConfigService.eportalConfig?.infoContactEmail
    };
  }

  // Displays i18n keys instead of actual values to allow identifying mismatches concerning translations
  // Should be removed once no longer needed EID-6490
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key === 'K') {
      this.i18nKeyDisplay.toggle();
    }
  }

  private addCustomIcon() {
    this.iconRegistry.addSvgIcon(
      'devhandover_self',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/devhandover_self.svg')
    );
    this.iconRegistry.addSvgIcon(
      'devhandover_expert',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/devhandover_expert.svg')
    );
  }
}
