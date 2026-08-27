import {ComponentFixture, TestBed} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {WINDOW} from '@oblique/oblique';
import {provideOAuthClient} from 'angular-oauth2-oidc';
import {PartnerCreationRequest} from '../../../../../api/generated';
import {PartnerRegistrationWizardService} from '../../wizard/partner-registration-wizard.service';
import {PartnerRegistrationStepProfileCreationComponent} from './partner-registration-step-profile-creation.component';

describe('PartnerRegistrationStepProfileCreationComponent', () => {
  let component: PartnerRegistrationStepProfileCreationComponent;
  let fixture: ComponentFixture<PartnerRegistrationStepProfileCreationComponent>;

  beforeEach(async () => {
    const wizardServiceMock = {
      updatePartnerDetails: jest.fn(),
      saveAndNext: jest.fn(),
      navigateToPreviousStep: jest.fn(),
      onSaveAndContinueLater: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, PartnerRegistrationStepProfileCreationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        provideOAuthClient(),
        {provide: WINDOW, useValue: window},
        {provide: PartnerRegistrationWizardService, useValue: wizardServiceMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerRegistrationStepProfileCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits nested contact and address payload when the form is valid', () => {
    const wizardService = TestBed.inject(PartnerRegistrationWizardService);

    component.form.patchValue({
      partnerType: PartnerCreationRequest.BusinessPartnerTypeEnum.Business,
      name: 'Example Org',
      address: {street: 'Test Street 1', postalCode: '3000', city: 'Bern', country: 'CH'},
      contact: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'contact@example.org',
        phone: '+41791234567',
        correspondingLanguage: 'DE'
      },
      confirmedCorrectness: true,
      readTermsAndConditions: true,
      readDataProtection: true
    });

    expect(wizardService.updatePartnerDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationName: 'Example Org',
        businessPartnerType: PartnerCreationRequest.BusinessPartnerTypeEnum.Business,
        address: expect.objectContaining({postalCode: '3000', city: 'Bern', country: 'CH'}),
        contact: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'contact@example.org',
          phone: '+41791234567',
          correspondingLanguage: 'DE'
        })
      })
    );
  });
});
