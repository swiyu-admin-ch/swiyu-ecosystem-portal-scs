import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {of} from 'rxjs';
import {BusinessPartner, BusinessPartnerApi, TrustOnboardingSubmission} from '../../../../../api/generated';
import {CountryService} from '../../../../../core/util/country.service';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {OnboardingStepOrganisationDetailsComponent} from './onboarding-step-organisation-details.component';

describe('OnboardingStepOrganisationDetailsComponent', () => {
  let component: OnboardingStepOrganisationDetailsComponent;
  let fixture: ComponentFixture<OnboardingStepOrganisationDetailsComponent>;
  let wizardServiceMock: {
    partnerId: string;
    submissionId: string;
    businessPartner: ReturnType<typeof signal<BusinessPartner | null>>;
    requestedBusinessPartnerType: WritableSignal<BusinessPartner.TypeEnum | undefined>;
    submission: WritableSignal<TrustOnboardingSubmission | undefined>;
    submissionRequest: Record<string, unknown>;
    updateOrganisationData: jest.Mock;
    saveAndNext: jest.Mock;
    navigateToPreviousStep: jest.Mock;
    onSaveAndContinueLater: jest.Mock;
  };

  beforeEach(async () => {
    const businessPartnerApiSpy = {
      getBusinessPartner: jest.fn().mockReturnValue(
        of({
          id: 'test-partner-id',
          type: 'organisation'
        })
      )
    };
    wizardServiceMock = {
      partnerId: 'test-partner-id',
      submissionId: 'sub-123',
      businessPartner: signal<BusinessPartner | null>(null),
      requestedBusinessPartnerType: signal(undefined) as WritableSignal<BusinessPartner.TypeEnum | undefined>,
      submission: signal(undefined) as WritableSignal<TrustOnboardingSubmission | undefined>,
      submissionRequest: {},
      updateOrganisationData: jest.fn(),
      saveAndNext: jest.fn(),
      navigateToPreviousStep: jest.fn(),
      onSaveAndContinueLater: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [OnboardingStepOrganisationDetailsComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideObliqueTestingConfiguration(),
        {provide: Window, useValue: window},
        {
          provide: BusinessPartnerApi,
          useValue: businessPartnerApiSpy
        },
        {provide: TrustOnboardingWizardService, useValue: wizardServiceMock},
        CountryService
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(OnboardingStepOrganisationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.form.get('hasUid')?.value).toBe(false);
      expect(component.form.get('readTermsAndConditions')?.value).toBe(false);
      expect(component.form.get('readPrivacyPolicy')?.value).toBe(false);
    });

    it('should have all required form controls', () => {
      expect(component.form.get('partnerType')).toBeTruthy();
      expect(component.form.get('hasUid')).toBeTruthy();
      expect(component.form.get('entityDefaultName')).toBeTruthy();
      expect(component.form.get('entityAddress')).toBeTruthy();
      expect(component.form.get('contactPerson')).toBeTruthy();
      expect(component.form.get('uid')).toBeTruthy();
      expect(component.form.get('readTermsAndConditions')).toBeTruthy();
      expect(component.form.get('readPrivacyPolicy')).toBeTruthy();
    });

    it('should initialize languages array', () => {
      expect(component.languages).toEqual(['EN', 'DE', 'FR', 'IT', 'RM']);
    });
  });

  describe('Form Validation', () => {
    it('should require partnerType', () => {
      const control = component.form.get('partnerType');
      control?.setValue(null);
      expect(control?.hasError('required')).toBe(true);
    });

    it('should require at least one entity name language', () => {
      const entityDefaultName = component.form.get('entityDefaultName');
      expect(entityDefaultName?.hasError('required')).toBe(true);

      entityDefaultName?.setValue('Test Organisation');
      expect(entityDefaultName?.hasError('required')).toBe(false);
    });

    it('should require all address fields', () => {
      const address = component.form.get('entityAddress');
      expect(address?.get('postalCode')?.hasError('required')).toBe(true);
      expect(address?.get('city')?.hasError('required')).toBe(true);
    });

    it('should require contact person firstName, lastName, and email', () => {
      const contactPerson = component.form.get('contactPerson');
      expect(contactPerson?.get('firstName')?.hasError('required')).toBe(true);
      expect(contactPerson?.get('lastName')?.hasError('required')).toBe(true);
      expect(contactPerson?.get('email')?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const email = component.form.get('contactPerson.email');
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);

      email?.setValue('valid@email.com');
      expect(email?.hasError('email')).toBe(false);
    });

    it('should require terms and conditions to be accepted', () => {
      const control = component.form.get('readTermsAndConditions');
      expect(control?.hasError('required')).toBe(true);

      control?.setValue(true);
      expect(control?.hasError('required')).toBe(false);
    });

    it('should require privacy policy to be accepted', () => {
      const control = component.form.get('readPrivacyPolicy');
      expect(control?.hasError('required')).toBe(true);

      control?.setValue(true);
      expect(control?.hasError('required')).toBe(false);
    });
  });

  describe('UID Validation', () => {
    it('should not require UID for business when hasUid is false', () => {
      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.Business);
      component.form.get('hasUid')?.setValue(false);
      fixture.detectChanges();

      const uidControl = component.form.get('uid');
      expect(uidControl?.disabled).toBe(true);
      expect(uidControl?.hasError('required')).toBe(false);
    });

    it('should require UID for business when hasUid is true', () => {
      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.Business);
      component.form.get('hasUid')?.setValue(true);
      fixture.detectChanges();

      const uidControl = component.form.get('uid');
      expect(uidControl?.enabled).toBe(true);
      expect(uidControl?.hasError('required')).toBe(true);
    });

    it('should require UID for governmental institution regardless of hasUid', () => {
      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.GovernmentalInstitution);
      component.form.get('hasUid')?.setValue(false);
      fixture.detectChanges();

      const uidControl = component.form.get('uid');
      expect(uidControl?.enabled).toBe(true);
      expect(uidControl?.hasError('required')).toBe(true);
    });

    it('should disable and clear UID for individual', () => {
      const uidControl = component.form.get('uid');
      uidControl?.setValue('CHE-123.456.789');

      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.Individual);
      fixture.detectChanges();

      expect(uidControl?.disabled).toBe(true);
      expect(uidControl?.value).toBe('');
      expect(uidControl?.hasError('required')).toBe(false);
    });

    it('should restore hasUid to true when switching from governmental institution back to business', () => {
      // Start: Business, hasUid=false (uid disabled)
      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.Business);
      component.form.get('hasUid')?.setValue(false);
      fixture.detectChanges();

      // Switch to GovernmentalInstitution -> uid gets enabled
      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.GovernmentalInstitution);
      fixture.detectChanges();

      expect(component.form.get('uid')?.enabled).toBe(true);

      // Switch back to Business -> hasUid should be restored to true, uid stays enabled
      component.form.get('partnerType')?.setValue(BusinessPartner.TypeEnum.Business);
      fixture.detectChanges();

      expect(component.form.get('hasUid')?.value).toBe(true);
      expect(component.form.get('uid')?.enabled).toBe(true);
    });
  });

  describe('Corresponding Language Sync', () => {
    it('should sync correspondingLanguage with contactPerson.correspondingLanguage', fakeAsync(() => {
      component.form.get('contactPerson.correspondingLanguage')?.setValue('DE');
      tick();
      expect(component.form.get('contactPerson.correspondingLanguage')?.value).toBe('DE');
    }));
  });

  describe('Saved Data Input', () => {
    it('should patch form values when savedData is provided', () => {
      const mockData: TrustOnboardingSubmission = {
        id: 'DEAD-BEEF-000',
        version: 1,
        partnerId: '000-000',
        entityEmail: 'test@test.ch',
        status: TrustOnboardingSubmission.StatusEnum.Unsubmitted,
        proofOfPossessionList: [],
        registryIds: {},
        entityName: {
          de: 'Test Organisation',
          fr: 'Organisation Test',
          it: '',
          en: '',
          rm: ''
        },
        entityAddress: {
          street: 'Test Street 1',
          postalCode: '3000',
          city: 'Bern',
          country: 'CH'
        },
        contactPerson: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+41 12 345 67 89'
        }
      };

      const wizardService = TestBed.inject(TrustOnboardingWizardService) as TrustOnboardingWizardService;
      wizardService.submission.set(mockData);
      wizardService.requestedBusinessPartnerType.set(BusinessPartner.TypeEnum.Business);
      fixture.detectChanges();

      expect(component.form.get('entityDefaultName')?.value).toBe('Test Organisation');
      expect(component.form.get('entityAddress.street')?.value).toBe('Test Street 1');
      expect(component.form.get('contactPerson.firstName')?.value).toBe('John');
    });
  });

  describe('Prefill Data Input from Base Onboarding', () => {
    it('should patch form values on initial load when business partner is loaded', () => {
      const mockPartner: BusinessPartner = {
        id: 'test-partner-id',
        name: 'Partner Organisation',
        type: BusinessPartner.TypeEnum.Business,
        contactEmailAddress: 'partner@test.ch',
        contactPhone: '+41 11 111 11 11',
        uid: 'CHE-111.222.333',
        address: {
          street: 'Partner Street 1',
          postalCode: '8000',
          city: 'Zurich',
          country: 'CH'
        }
      };

      wizardServiceMock.requestedBusinessPartnerType.set(BusinessPartner.TypeEnum.Business);
      wizardServiceMock.businessPartner.set(mockPartner);
      fixture.detectChanges();

      expect(component.form.get('entityDefaultName')?.value).toBe('Partner Organisation');
      expect(component.form.get('entityAddress.street')?.value).toBe('Partner Street 1');
      expect(component.form.get('entityAddress.city')?.value).toBe('Zurich');
      expect(component.form.get('entityAddress.postalCode')?.value).toBe('8000');
      expect(component.form.get('uid')?.value).toBe('CHE-111.222.333');
      expect(component.form.get('partnerType')?.value).toBe(BusinessPartner.TypeEnum.Business);
    });

    it('should not override form values when the submission overrode them', () => {
      const mockPartner: BusinessPartner = {
        id: 'test-partner-id',
        name: 'Partner Organisation',
        type: BusinessPartner.TypeEnum.Business,
        contactEmailAddress: 'partner@test.ch',
        contactPhone: '+41 11 111 11 11',
        uid: 'CHE-111.222.333',
        address: {
          street: 'Partner Street 1',
          postalCode: '8000',
          city: 'Zurich',
          country: 'CH'
        }
      };

      const mockSubmission: TrustOnboardingSubmission = {
        id: 'DEAD-BEEF-000',
        version: 1,
        partnerId: '000-000',
        entityEmail: 'test@test.ch',
        businessPartnerType: BusinessPartner.TypeEnum.Business,
        status: TrustOnboardingSubmission.StatusEnum.Unsubmitted,
        proofOfPossessionList: [],
        registryIds: {UID: 'CHE-999.888.777'},
        entityName: {
          de: 'Submission Organisation',
          fr: 'Organisation Test',
          it: '',
          en: '',
          rm: ''
        },
        entityAddress: {
          street: 'Submission Street 1',
          postalCode: '3000',
          city: 'Bern',
          country: 'CH'
        },
        contactPerson: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+41 12 345 67 89'
        }
      };

      wizardServiceMock.submission.set(mockSubmission);
      wizardServiceMock.requestedBusinessPartnerType.set(BusinessPartner.TypeEnum.Business);
      fixture.detectChanges();

      wizardServiceMock.businessPartner.set(mockPartner);
      fixture.detectChanges();

      expect(component.form.get('entityDefaultName')?.value).toBe('Submission Organisation');
      expect(component.form.get('entityAddress.street')?.value).toBe('Submission Street 1');
      expect(component.form.get('entityAddress.city')?.value).toBe('Bern');
      expect(component.form.get('entityAddress.postalCode')?.value).toBe('3000');
      expect(component.form.get('uid')?.value).toBe('CHE-999.888.777');
      expect(component.form.get('partnerType')?.value).toBe(BusinessPartner.TypeEnum.Business);
    });
  });
});
