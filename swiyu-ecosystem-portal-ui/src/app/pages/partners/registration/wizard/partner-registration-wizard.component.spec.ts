import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {BusinessPartnerApi, IdentifierApi} from '../../../../api/generated';
import {OrganizationService} from '../../../../api/organization.service';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {AuthService} from '../../../../core/security/auth.service';
import {AbstractOnboardingStepComponent} from '../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {PartnerRegistrationWizardComponent} from './partner-registration-wizard.component';
import {PartnerRegistrationWizardService} from './partner-registration-wizard.service';

class MockStepComponent extends AbstractOnboardingStepComponent {
  override validate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe('PartnerRegistrationWizardComponent', () => {
  let fixture: ComponentFixture<PartnerRegistrationWizardComponent>;
  let component: PartnerRegistrationWizardComponent;
  let wizardService: PartnerRegistrationWizardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerRegistrationWizardComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: AppConfigService,
          useValue: {
            get isFunctionalityPaymentEnabled() {
              return true;
            }
          }
        },
        {
          provide: OrganizationService,
          useValue: {
            registerBusinessPartner: jest.fn()
          }
        },
        {
          provide: IdentifierApi,
          useValue: {
            getAllIdentifiersOfPartner: jest.fn()
          }
        },
        {
          provide: BusinessPartnerApi,
          useValue: {
            getBusinessPartner: jest.fn()
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn().mockReturnValue({afterClosed: () => of(false)})
          }
        },
        {
          provide: AuthService,
          useValue: {
            refreshToken: jest.fn().mockReturnValue(of({})),
            startLoginFlowWithReturnUrl: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerRegistrationWizardComponent);
    component = fixture.componentInstance;
    wizardService = fixture.debugElement.injector.get(PartnerRegistrationWizardService);
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('delegates activated step to wizard service', () => {
    const serviceSpy = jest.spyOn(wizardService, 'setActiveStep');
    const step = new MockStepComponent();

    component.onStepActivated(step);

    expect(serviceSpy).toHaveBeenCalledWith(step);
  });

  it('clears active step when routed component is not an onboarding step', () => {
    const serviceSpy = jest.spyOn(wizardService, 'setActiveStep');

    component.onStepActivated({});

    expect(serviceSpy).toHaveBeenCalledWith(null);
  });
});
