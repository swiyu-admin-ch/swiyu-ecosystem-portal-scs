import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
  BusinessPartnerApi,
  IdentifierApi,
  PagedModelIdentifierResponse,
  TrustOnboardingApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionType
} from '../../../../api/generated';
import {TrustOnboardingWizardComponent} from './trust-onboarding-wizard.component';
import {TrustOnboardingWizardService} from './trust-onboarding-wizard.service';

describe('TrustOnboardingWizardComponent', () => {
  let component: TrustOnboardingWizardComponent;
  let fixture: ComponentFixture<TrustOnboardingWizardComponent>;
  let router: Router;
  let service: TrustOnboardingWizardService;
  let trustOnboardingApi: TrustOnboardingApi;
  let activatedRouteMock: {firstChild: {snapshot: {url: {path: string}[]}} | null; snapshot: {url: never[]}};

  const MOCK_PARTNER_ID = 'partner-001';
  const MOCK_SUBMISSION_ID = 'sub-123';
  const MOCK_SUBMISSION: TrustOnboardingSubmission = {
    type: TrustOnboardingSubmissionType.Registration,
    alerts: [],
    status: 'UNSUBMITTED',
    id: MOCK_SUBMISSION_ID,
    version: 1,
    partnerId: MOCK_PARTNER_ID,
    entityName: {
      default: 'Test Corp',
      'de-CH': 'Test Corp'
    },
    entityAddress: {
      street: 'street',
      city: 'city',
      postalCode: '1234',
      country: 'country'
    },
    entityEmail: 'contact@test.com',
    contactPerson: {
      firstName: 'first',
      lastName: 'last',
      phone: '1234567890',
      email: 'john.doe@test.com',
      correspondingLanguage: 'DE'
    },
    registryIds: {},
    correspondingLanguage: 'DE',
    proofOfPossessionList: []
  };

  /**
   * The wizard receives the ids through the router input bindings, so the test has to set them as
   * component inputs instead of faking route parameters.
   */
  const initWizard = (): void => {
    fixture.componentRef.setInput('partnerId', MOCK_PARTNER_ID);
    fixture.componentRef.setInput('submissionId', MOCK_SUBMISSION_ID);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    const apiSpy = {
      getTrustOnboardingSubmission: jest.fn(),
      updateTrustOnboardingSubmission: jest.fn(),
      submitTrustOnboardingSubmission: jest.fn()
    };

    const businessPartnerApiSpy = {
      getBusinessPartner: jest.fn().mockReturnValue(of({id: MOCK_PARTNER_ID, name: 'Test Corp'}))
    };

    const identifierApiSpy = {
      getAllIdentifiersOfPartner: jest.fn().mockReturnValue(
        of({
          content: [
            {
              did: 'did:key:1'
            }
          ]
        } as PagedModelIdentifierResponse)
      )
    };

    activatedRouteMock = {
      firstChild: null,
      snapshot: {url: []}
    };

    await TestBed.configureTestingModule({
      imports: [TrustOnboardingWizardComponent, ReactiveFormsModule, MatIconTestingModule, TranslateModule.forRoot()],
      providers: [
        {
          // Only the child route is read by the wizard, to sync the stepper with the active step segment.
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        },
        {
          provide: TrustOnboardingApi,
          useValue: apiSpy
        },
        {
          provide: BusinessPartnerApi,
          useValue: businessPartnerApiSpy
        },
        {
          provide: IdentifierApi,
          useValue: identifierApiSpy
        },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrustOnboardingWizardComponent);
    component = fixture.componentInstance;
    service = component['service'];

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    trustOnboardingApi = TestBed.inject(TrustOnboardingApi);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should NOT fetch the submission while the inputs are not set', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(trustOnboardingApi.getTrustOnboardingSubmission).not.toHaveBeenCalled();
      expect(service.submission()).toBeUndefined();
    }));

    it('should fetch the submission once partnerId and submissionId inputs are set', fakeAsync(() => {
      (trustOnboardingApi.getTrustOnboardingSubmission as jest.Mock).mockReturnValue(of(MOCK_SUBMISSION));

      initWizard();
      tick();

      expect(trustOnboardingApi.getTrustOnboardingSubmission).toHaveBeenCalledWith({
        id: MOCK_SUBMISSION_ID
      });
      expect(service.submission()).toEqual(MOCK_SUBMISSION);
    }));

    it('should take the flow from the type of the loaded submission', fakeAsync(() => {
      (trustOnboardingApi.getTrustOnboardingSubmission as jest.Mock).mockReturnValue(
        of({...MOCK_SUBMISSION, type: TrustOnboardingSubmissionType.Renewal})
      );

      initWizard();
      tick();

      expect(service.config()?.flow).toBe(TrustOnboardingSubmissionType.Renewal);
    }));
  });

  describe('Stepper', () => {
    it('should render one step per visible step of the flow', fakeAsync(() => {
      (trustOnboardingApi.getTrustOnboardingSubmission as jest.Mock).mockReturnValue(of(MOCK_SUBMISSION));

      initWizard();
      tick();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.mat-step-header').length).toBe(service.visibleSteps().length);
    }));

    it('should sync formal-proof to index 1 after reload in the profile change voluntary flow', fakeAsync(() => {
      activatedRouteMock.firstChild = {
        snapshot: {
          url: [{path: 'formal-proof'}]
        }
      };
      (trustOnboardingApi.getTrustOnboardingSubmission as jest.Mock).mockReturnValue(
        of({...MOCK_SUBMISSION, type: TrustOnboardingSubmissionType.ProfileChangeVoluntary})
      );

      initWizard();
      tick();
      fixture.detectChanges();

      expect(service.visibleSteps().map(step => step.id)).toEqual([
        'profile',
        'formal-proof',
        'technical-proof',
        'approval'
      ]);
      expect(service.currentStepIndex()).toBe(1);
      expect(component['stepper']?.selectedIndex).toBe(1);
    }));

    it('should sync technical-proof to index 1 after reload in the renewal flow', fakeAsync(() => {
      activatedRouteMock.firstChild = {
        snapshot: {
          url: [{path: 'technical-proof'}]
        }
      };
      (trustOnboardingApi.getTrustOnboardingSubmission as jest.Mock).mockReturnValue(
        of({...MOCK_SUBMISSION, type: TrustOnboardingSubmissionType.Renewal})
      );

      initWizard();
      tick();
      fixture.detectChanges();

      expect(service.visibleSteps().map(step => step.id)).toEqual(['profile', 'technical-proof', 'approval']);
      expect(service.currentStepIndex()).toBe(1);
      expect(component['stepper']?.selectedIndex).toBe(1);
    }));
  });
});
