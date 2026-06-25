import {APP_BASE_HREF, DOCUMENT} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {WINDOW} from '@oblique/oblique';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {PartnerRegistrationWizardService} from '../../wizard/partner-registration-wizard.service';
import {
  EnvironmentSelection,
  PartnerRegistrationStepProductSelectionComponent,
  TrustLevel
} from './partner-registration-step-product-selection.component';

describe('PartnerRegistrationStepProductSelectionComponent', () => {
  let fixture: ComponentFixture<PartnerRegistrationStepProductSelectionComponent>;
  let component: PartnerRegistrationStepProductSelectionComponent;
  let appBaseHref = '/ui';
  let wizardServiceMock: {
    saveAndNext: jest.Mock;
    navigateToPreviousStep: jest.Mock;
    onSaveAndContinueLater: jest.Mock;
  };
  let queryParams: Record<string, string>;
  let mockLocation: {href: string; origin: string; protocol: string};
  let mockDocument: Document;

  const appConfigMock = {
    environments: {
      primaryBaseUrl: 'https://primary.example',
      integrationBaseUrl: 'https://integration.example'
    },
    isFunctionalityPrimaryEnvironmentEnabled: true
  };

  const setMockLocation = (origin: string, protocol = 'https:') => {
    mockLocation.origin = origin;
    mockLocation.protocol = protocol;
  };

  beforeEach(async () => {
    wizardServiceMock = {
      saveAndNext: jest.fn(),
      navigateToPreviousStep: jest.fn(),
      onSaveAndContinueLater: jest.fn()
    };

    appConfigMock.environments.primaryBaseUrl = 'https://primary.example';
    appConfigMock.environments.integrationBaseUrl = 'https://integration.example';
    appConfigMock.isFunctionalityPrimaryEnvironmentEnabled = true;
    queryParams = {};

    mockLocation = {href: '', origin: 'http://localhost', protocol: 'http:'};
    mockDocument = new Proxy(document, {
      get(target, prop: string | symbol) {
        if (prop === 'location') {
          return mockLocation as unknown as Location;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = (target as any)[prop];
        return typeof val === 'function' ? val.bind(target) : val;
      }
    }) as Document;

    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, PartnerRegistrationStepProductSelectionComponent],
      providers: [
        provideTranslateService(),
        provideRouter([
          {path: 'onboarding/base/register', component: PartnerRegistrationStepProductSelectionComponent}
        ]),
        {provide: APP_BASE_HREF, useFactory: () => appBaseHref},
        {provide: WINDOW, useValue: window},
        {provide: DOCUMENT, useValue: mockDocument},
        {provide: AppConfigService, useValue: appConfigMock},
        {provide: PartnerRegistrationWizardService, useValue: wizardServiceMock},
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {queryParamMap: {get: (key: string) => queryParams[key] ?? null}}}
        }
      ]
    }).compileComponents();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(PartnerRegistrationStepProductSelectionComponent);
    component = fixture.componentInstance;
  };

  // ── Onboarding route ──────────────────────────────────────────────────────────

  it('builds onboarding route from AppRoutes', () => {
    createComponent();
    expect(component.onboardingRoute).toBe('/ui/onboarding/base/register');
  });

  it('normalizes APP_BASE_HREF with trailing slash', () => {
    appBaseHref = '/ui/';
    createComponent();
    expect(component.onboardingRoute).toBe('/ui/onboarding/base/register');
  });

  // ── URL building ──────────────────────────────────────────────────────────────

  it('builds primary onboarding URL from environment config', () => {
    createComponent();
    fixture.detectChanges();
    expect(component.primaryOnboardingUrl()).toBe('https://primary.example/ui/onboarding/base/register');
  });

  it('normalizes base URLs without protocol using current protocol', () => {
    appConfigMock.environments.primaryBaseUrl = 'primary.example:4501';
    createComponent();
    fixture.detectChanges();
    expect(component.primaryOnboardingUrl()).toBe('http://primary.example:4501/ui/onboarding/base/register');
  });

  it('uses only the origin when environment base URL contains a path', () => {
    appConfigMock.environments.integrationBaseUrl = 'https://integration.example/some/path';
    createComponent();
    fixture.detectChanges();
    expect(component.integrationOnboardingUrl()).toBe('https://integration.example/ui/onboarding/base/register');
  });

  it('returns null for primary onboarding URL when base URL is invalid', () => {
    appConfigMock.environments.primaryBaseUrl = 'https:// invalid-host';
    createComponent();
    fixture.detectChanges();
    expect(component.primaryOnboardingUrl()).toBeNull();
  });

  it('returns null for onboarding URLs when environment base URLs are missing', () => {
    appConfigMock.environments.primaryBaseUrl = '';
    appConfigMock.environments.integrationBaseUrl = undefined as unknown as string;
    createComponent();
    fixture.detectChanges();
    expect(component.primaryOnboardingUrl()).toBeNull();
    expect(component.integrationOnboardingUrl()).toBeNull();
  });

  // ── Environment selection ─────────────────────────────────────────────────────

  it('starts with no environment pre-selected', () => {
    createComponent();
    fixture.detectChanges();
    expect(component.selection()).toBeNull();
  });

  it('does not auto-select environment based on current URL', () => {
    appConfigMock.environments.integrationBaseUrl = 'http://localhost';
    createComponent();
    fixture.detectChanges();
    expect(component.selection()).toBeNull();
  });

  it('selectEnvironment sets the selection signal', () => {
    createComponent();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    expect(component.selection()).toBe(EnvironmentSelection.PRIMARY);
  });

  it('selectEnvironment clears the environment selection error', () => {
    createComponent();
    component.environmentSelectionError.set(true);
    component.selectEnvironment(EnvironmentSelection.INTEGRATION);
    expect(component.environmentSelectionError()).toBe(false);
  });

  // ── isPreview ─────────────────────────────────────────────────────────────────

  it('isPreview is false when no environment is selected', () => {
    createComponent();
    expect(component.isPreview()).toBe(false);
  });

  it('isPreview is true when integration is selected', () => {
    createComponent();
    component.selectEnvironment(EnvironmentSelection.INTEGRATION);
    expect(component.isPreview()).toBe(true);
  });

  it('isPreview is false when primary is selected', () => {
    createComponent();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    expect(component.isPreview()).toBe(false);
  });

  // ── proceedToProducts ─────────────────────────────────────────────────────────

  it('proceedToProducts shows error and does not reveal products when no env is selected', () => {
    createComponent();
    fixture.detectChanges();
    component.proceedToProducts();
    expect(component.environmentSelectionError()).toBe(true);
    expect(component.showProducts()).toBe(false);
  });

  it('proceedToProducts reveals products when the selected env matches the current env', () => {
    setMockLocation('https://primary.example');
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    component.proceedToProducts();
    expect(component.showProducts()).toBe(true);
  });

  it('proceedToProducts redirects to integration URL with env param when integration is selected on primary env', () => {
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.INTEGRATION);
    component.proceedToProducts();
    expect(mockLocation.href).toBe('https://integration.example/ui/onboarding/base/register?env=integration');
    expect(component.showProducts()).toBe(false);
  });

  it('proceedToProducts redirects to primary URL with env param when primary is selected on integration env', () => {
    setMockLocation('https://integration.example');
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    component.proceedToProducts();
    expect(mockLocation.href).toBe('https://primary.example/ui/onboarding/base/register?env=primary');
  });

  // ── selectEnvironment while products are shown ────────────────────────────────

  it('selectEnvironment immediately redirects when products are shown and a different env is selected', () => {
    setMockLocation('https://primary.example');
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    component.showProducts.set(true);
    component.selectEnvironment(EnvironmentSelection.INTEGRATION);
    expect(mockLocation.href).toBe('https://integration.example/ui/onboarding/base/register?env=integration');
  });

  it('selectEnvironment does not redirect when products are shown and the same env is re-selected', () => {
    setMockLocation('https://primary.example');
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    component.showProducts.set(true);
    mockLocation.href = '';
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    expect(mockLocation.href).toBe('');
  });

  // ── env query param pre-selection ─────────────────────────────────────────────

  it('pre-selects integration and shows products when env=integration query param is present', () => {
    queryParams['env'] = 'integration';
    createComponent();
    fixture.detectChanges();
    expect(component.selection()).toBe(EnvironmentSelection.INTEGRATION);
    expect(component.showProducts()).toBe(true);
  });

  it('pre-selects primary and shows products when env=primary query param is present', () => {
    queryParams['env'] = 'primary';
    createComponent();
    fixture.detectChanges();
    expect(component.selection()).toBe(EnvironmentSelection.PRIMARY);
    expect(component.showProducts()).toBe(true);
  });

  it('ignores unknown env query param values', () => {
    queryParams['env'] = 'invalid';
    createComponent();
    fixture.detectChanges();
    expect(component.selection()).toBeNull();
    expect(component.showProducts()).toBe(false);
  });

  // ── proceedFromProductSelection ───────────────────────────────────────────────

  it('proceedFromProductSelection calls saveAndNext when same env is selected and form is valid', async () => {
    setMockLocation('https://primary.example');
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.PRIMARY);
    component.trustLevelForm.get('trustLevel')?.setValue(TrustLevel.TRUST);
    await component.proceedFromProductSelection();
    expect(wizardServiceMock.saveAndNext).toHaveBeenCalled();
  });

  it('proceedFromProductSelection redirects to target env when different env and form is valid', async () => {
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.INTEGRATION);
    component.trustLevelForm.get('trustLevel')?.setValue(TrustLevel.TRUST);
    await component.proceedFromProductSelection();
    expect(mockLocation.href).toBe('https://integration.example/ui/onboarding/base/register?env=integration');
    expect(wizardServiceMock.saveAndNext).not.toHaveBeenCalled();
  });

  it('proceedFromProductSelection does not navigate when form is invalid', async () => {
    createComponent();
    fixture.detectChanges();
    component.selectEnvironment(EnvironmentSelection.INTEGRATION);
    mockLocation.href = '';
    await component.proceedFromProductSelection();
    expect(mockLocation.href).toBe('');
    expect(wizardServiceMock.saveAndNext).not.toHaveBeenCalled();
  });

  // ── validate ──────────────────────────────────────────────────────────────────

  it('validate returns false and marks form touched when trustLevel is not set', async () => {
    createComponent();
    const isValid = await component.validate();
    expect(isValid).toBe(false);
    expect(component.trustLevelForm.touched).toBe(true);
  });

  it('validate returns true when trustLevel is set', async () => {
    createComponent();
    component.trustLevelForm.get('trustLevel')?.setValue(TrustLevel.TRUST);
    const isValid = await component.validate();
    expect(isValid).toBe(true);
  });

  // ── isPrimaryEnvironmentEnabled ───────────────────────────────────────────────

  it('isPrimaryEnvironmentEnabled reflects appConfigService flag', () => {
    appConfigMock.isFunctionalityPrimaryEnvironmentEnabled = false;
    createComponent();
    expect(component.isPrimaryEnvironmentEnabled()).toBe(false);
  });

  it('primary environment card is disabled when flag is false', () => {
    appConfigMock.isFunctionalityPrimaryEnvironmentEnabled = false;
    createComponent();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[data-cy="btnPrimaryEnvironment"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('primary environment card is enabled when flag is true', () => {
    createComponent();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[data-cy="btnPrimaryEnvironment"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('integration environment card is always enabled', () => {
    createComponent();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[data-cy="btnIntegrationEnvironment"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  it('calls navigateToPreviousStep when back button is clicked', () => {
    createComponent();
    fixture.detectChanges();
    const backButton = fixture.nativeElement.querySelector('[data-cy="btnDidSelectionPrevious"]') as HTMLButtonElement;
    backButton.click();
    expect(wizardServiceMock.navigateToPreviousStep).toHaveBeenCalled();
  });
});
