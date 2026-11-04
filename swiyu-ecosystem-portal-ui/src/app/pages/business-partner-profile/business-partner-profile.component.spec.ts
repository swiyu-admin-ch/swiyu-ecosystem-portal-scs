import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {of} from 'rxjs';
import {BusinessPartner, BusinessPartnerApi, Language, TrustOnboardingApi} from '../../api/generated';
import {BusinessPartnerProfileComponent} from './business-partner-profile.component';

describe('BusinessPartnerProfileComponent', () => {
  let component: BusinessPartnerProfileComponent;
  let fixture: ComponentFixture<BusinessPartnerProfileComponent>;
  let businessPartnerApiMock: {getBusinessPartner: jest.Mock; updateBusinessPartner: jest.Mock};

  const basePartner: BusinessPartner = {
    id: 'test-partner-id',
    entityName: {default: 'Partner Organisation'},
    type: BusinessPartner.TypeEnum.Business
  };

  const createComponent = (partner: BusinessPartner) => {
    businessPartnerApiMock.getBusinessPartner.mockReturnValue(of(partner));
    fixture = TestBed.createComponent(BusinessPartnerProfileComponent);
    fixture.componentRef.setInput('businessPartnerId', partner.id);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    businessPartnerApiMock = {
      getBusinessPartner: jest.fn(),
      updateBusinessPartner: jest.fn()
    };

    await TestBed.configureTestingModule({
      providers: [
        provideObliqueTestingConfiguration(),
        {provide: BusinessPartnerApi, useValue: businessPartnerApiMock},
        {provide: TrustOnboardingApi, useValue: {createTrustOnboardingSubmission: jest.fn()}}
      ],
      imports: [BusinessPartnerProfileComponent, RouterModule.forRoot([]), TranslateModule.forRoot()]
    }).compileComponents();
  });

  describe('Contact prefill', () => {
    it('should prefill the contact form from the nested contact object', () => {
      createComponent({
        ...basePartner,
        contact: {
          firstName: 'Anna',
          lastName: 'Muster',
          email: 'anna.muster@example.com',
          phone: '+41 79 123 45 67',
          correspondingLanguage: Language.De
        }
      });

      expect(component.contactForm.getRawValue()).toEqual({
        firstName: 'Anna',
        lastName: 'Muster',
        email: 'anna.muster@example.com',
        phone: '+41 79 123 45 67',
        correspondingLanguage: Language.De
      });
    });

    it('should leave the contact form empty when the partner has no contact', () => {
      createComponent(basePartner);

      expect(component.contactForm.getRawValue()).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        correspondingLanguage: ''
      });
    });
  });
});
