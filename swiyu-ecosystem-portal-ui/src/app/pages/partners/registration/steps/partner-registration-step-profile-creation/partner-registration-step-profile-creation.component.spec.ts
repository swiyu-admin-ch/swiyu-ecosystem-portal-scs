import {ComponentFixture, TestBed} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {WINDOW} from '@oblique/oblique';
import {provideOAuthClient} from 'angular-oauth2-oidc';
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
});
