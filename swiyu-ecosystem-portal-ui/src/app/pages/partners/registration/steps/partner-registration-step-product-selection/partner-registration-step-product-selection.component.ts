import {APP_BASE_HREF, DOCUMENT, NgOptimizedImage} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardImage, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {ObButtonModule, ObSelectableGroupDirective} from '@oblique/oblique';
import {EnvironmentsConfig} from '../../../../../api/generated';
import {AppRoutes} from '../../../../../app.routes';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {isIntegrationEnvironment, parseEnvironmentUrl} from '../../../../../core/util/environment-utils';
import {AbstractOnboardingStepComponent} from '../../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {PartnerRegistrationWizardService} from '../../wizard/partner-registration-wizard.service';

export enum EnvironmentSelection {
  PRIMARY = 'primary',
  INTEGRATION = 'integration'
}

export enum TrustLevel {
  BASIC = 'basic',
  TRUST = 'trust'
}

@Component({
  selector: 'app-partner-registration-step-product-selection',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatIcon,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    NgOptimizedImage,
    MatCardImage,
    MatButtonModule,
    ObButtonModule,
    ObSelectableGroupDirective,
    MatSlideToggle
  ],
  templateUrl: 'partner-registration-step-product-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: AbstractOnboardingStepComponent, useExisting: PartnerRegistrationStepProductSelectionComponent}
  ],
  styleUrls: ['partner-registration-step-product-selection.component.scss']
})
export class PartnerRegistrationStepProductSelectionComponent
  extends AbstractOnboardingStepComponent
  implements OnInit
{
  protected readonly document = inject<Document>(DOCUMENT);
  protected readonly wizardService = inject(PartnerRegistrationWizardService);
  private readonly appBaseHref = inject(APP_BASE_HREF);

  readonly appConfigService = inject(AppConfigService);
  readonly EnvironmentSelection = EnvironmentSelection;
  readonly TrustLevel = TrustLevel;

  selection = signal<EnvironmentSelection | null>(null);
  environments = signal<EnvironmentsConfig | undefined>(undefined);
  showProducts = signal(false);
  showGovPricing = signal(false);
  environmentSelectionError = signal(false);
  private readonly isOnIntegrationEnvironment = signal(false);
  private readonly fb = inject(FormBuilder);

  readonly trustLevelForm = this.fb.group({
    trustLevel: this.fb.control<TrustLevel | null>(null, Validators.required)
  });
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly onboardingRoute = this.createOnboardingRoute();
  readonly primaryOnboardingUrl = signal<string | null>(null);
  readonly integrationOnboardingUrl = signal<string | null>(null);

  readonly isPreview = computed(() => this.selection() === EnvironmentSelection.INTEGRATION);
  readonly requiresEnvironmentRedirect = computed(() => this.isPreview() !== this.isOnIntegrationEnvironment());
  readonly isPrimaryEnvironmentEnabled = computed(() => this.appConfigService.isFunctionalityPrimaryEnvironmentEnabled);

  ngOnInit(): void {
    this.environments.set(this.appConfigService.environments);
    this.primaryOnboardingUrl.set(this.buildEnvironmentOnboardingUrl(this.environments()?.primaryBaseUrl));
    this.integrationOnboardingUrl.set(this.buildEnvironmentOnboardingUrl(this.environments()?.integrationBaseUrl));

    const integrationBaseUrl = this.environments()?.integrationBaseUrl;
    this.isOnIntegrationEnvironment.set(isIntegrationEnvironment(integrationBaseUrl, this.document.location));

    const envParam = this.route.snapshot.queryParamMap.get('env') as EnvironmentSelection | null;
    if (envParam === EnvironmentSelection.PRIMARY || envParam === EnvironmentSelection.INTEGRATION) {
      this.showProducts.set(true);
      this.selectEnvironment(envParam);
    }
  }

  get hasError() {
    return (
      this.trustLevelForm.controls.trustLevel.hasError('required') && this.trustLevelForm.controls.trustLevel.touched
    );
  }

  override async validate(): Promise<boolean> {
    const isValid = this.trustLevelForm.valid;
    if (!isValid) {
      this.trustLevelForm.markAllAsTouched();
    }
    return isValid;
  }

  override isValid(): boolean {
    return this.trustLevelForm.valid;
  }

  onEnvironmentCardKeydown(event: KeyboardEvent, env: EnvironmentSelection): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (env === EnvironmentSelection.PRIMARY && !this.isPrimaryEnvironmentEnabled()) {
        return;
      }
      this.selectEnvironment(env);
    }
  }

  onTrustLevelCardKeydown(event: KeyboardEvent, level: TrustLevel): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.trustLevelForm.get('trustLevel')?.setValue(level);
    }
  }

  selectEnvironment(env: EnvironmentSelection): void {
    this.selection.set(env);
    this.environmentSelectionError.set(false);

    if (this.showProducts()) {
      this.redirectIfRequired();
    }
  }

  proceedToProducts(): void {
    if (!this.selection()) {
      this.environmentSelectionError.set(true);
      return;
    }

    if (this.redirectIfRequired()) {
      return;
    }

    this.showProducts.set(true);
  }

  async proceedFromProductSelection(): Promise<void> {
    if (this.requiresEnvironmentRedirect()) {
      const isValid = await this.validate();
      if (!isValid) {
        return;
      }
      const targetBaseUrl = this.isPreview() ? this.integrationOnboardingUrl() : this.primaryOnboardingUrl();
      if (targetBaseUrl) {
        this.document.location.href = `${targetBaseUrl}?env=${this.selection()}`;
      }
    } else {
      this.wizardService.saveAndNext();
    }
  }

  private redirectIfRequired(): boolean {
    if (this.requiresEnvironmentRedirect()) {
      const targetBaseUrl = this.isPreview() ? this.integrationOnboardingUrl() : this.primaryOnboardingUrl();
      if (targetBaseUrl) {
        this.document.location.href = `${targetBaseUrl}?env=${this.selection()}`;
      }
      return true;
    }
    return false;
  }

  private createOnboardingRoute(): string {
    const onboardingPath = this.router.serializeUrl(this.router.createUrlTree(AppRoutes.baseOnboardingWizard()));
    const normalizedBaseHref = this.appBaseHref.replace(/\/$/, '');
    return `${normalizedBaseHref}${onboardingPath}`;
  }

  private buildEnvironmentOnboardingUrl(baseUrl: string | undefined): string | null {
    const environmentUrl = parseEnvironmentUrl(baseUrl, this.document.location.protocol);
    return environmentUrl ? `${environmentUrl.origin}${this.onboardingRoute}` : null;
  }
}
