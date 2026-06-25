import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {Router} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {provideOAuthClient} from 'angular-oauth2-oidc';
import {AppRoutes} from '../../../../../app/app.routes';
import {ProcessStepComponent} from '../../../../../app/shared/process/process-step/process-step.component';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {ProcessComponent} from '../../../../shared/process/process.component';
import {PartnerRegistrationIntroductionComponent} from './partner-registration-introduction.component';

describe('PartnerRegistrationIntroductionComponent', () => {
  let fixture: ComponentFixture<PartnerRegistrationIntroductionComponent>;
  let component: PartnerRegistrationIntroductionComponent;
  let routerNavigateMock: jest.Mock;
  let paymentEnabled = false;

  beforeEach(async () => {
    routerNavigateMock = jest.fn();

    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, PartnerRegistrationIntroductionComponent, ProcessComponent, ProcessStepComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        provideOAuthClient(),
        {
          provide: Router,
          useValue: {
            navigate: routerNavigateMock
          }
        },
        {
          provide: AppConfigService,
          useValue: {
            get isFunctionalityPaymentEnabled() {
              return paymentEnabled;
            }
          }
        }
      ]
    }).compileComponents();
  });

  it('includes payment step when payment functionality is enabled', () => {
    paymentEnabled = true;
    fixture = TestBed.createComponent(PartnerRegistrationIntroductionComponent);
    component = fixture.componentInstance;

    const steps = component['registrationSteps'];
    expect(steps).toHaveLength(4);
    expect(steps.some(step => step.title === 'eportal_onboarding_start_cardTitle_paymentOptions')).toBe(true);
  });

  it('omits payment step when payment functionality is disabled', () => {
    paymentEnabled = false;
    fixture = TestBed.createComponent(PartnerRegistrationIntroductionComponent);
    component = fixture.componentInstance;

    const steps = component['registrationSteps'];
    expect(steps).toHaveLength(3);
    expect(steps.some(step => step.title === 'eportal_onboarding_start_cardTitle_paymentOptions')).toBe(false);
  });

  it('navigates to onboarding wizard when registration starts', () => {
    paymentEnabled = false;
    fixture = TestBed.createComponent(PartnerRegistrationIntroductionComponent);
    component = fixture.componentInstance;

    component.startRegistration();

    expect(routerNavigateMock).toHaveBeenCalledWith(AppRoutes.baseOnboardingWizard());
  });
});
