import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {MatStepper} from '@angular/material/stepper';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
  BusinessPartnerApi,
  IdentifierApi,
  PagedModelIdentifierResponse,
  TrustOnboardingApi,
  TrustOnboardingSubmission
} from '../../../../api/generated';
import {TrustOnboardingWizardComponent} from './trust-onboarding-wizard.component';
import {TrustOnboardingWizardService} from './trust-onboarding-wizard.service';

describe('TrustOnboardingWizardComponent', () => {
  let component: TrustOnboardingWizardComponent;
  let fixture: ComponentFixture<TrustOnboardingWizardComponent>;
  let router: Router;
  let service: TrustOnboardingWizardService;
  let trustOnboardingApi: TrustOnboardingApi;
  const mockSnapshot = {
    paramMap: convertToParamMap({}) // Start with empty params
  };
  const MOCK_SUBMISSION_ID = 'sub-123';
  const MOCK_SUBMISSION: TrustOnboardingSubmission = {
    status: 'UNSUBMITTED',
    id: MOCK_SUBMISSION_ID,
    version: 1,
    partnerId: 'partner-001',
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
      email: 'john.doe@test.com'
    },
    registryIds: {},
    correspondingLanguage: 'DE',
    proofOfPossessionList: []
  };

  beforeEach(async () => {
    const apiSpy = {
      getTrustOnboardingSubmission: jest.fn(),
      updateTrustOnboardingSubmission: jest.fn(),
      submitTrustOnboardingSubmission: jest.fn()
    };

    const businessPartnerApiSpy = {
      getBusinessPartner: jest.fn().mockReturnValue(of({id: 'partner-001', name: 'Test Corp'}))
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

    await TestBed.configureTestingModule({
      imports: [
        TrustOnboardingWizardComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatIconTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: mockSnapshot
          }
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

    component.stepper = {
      selectedIndex: 0,
      next: jest.fn()
    } as unknown as MatStepper;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should NOT fetch submission if submissionId is missing from query params', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      expect(trustOnboardingApi.getTrustOnboardingSubmission).not.toHaveBeenCalled();
      expect(service.submission()).toBeUndefined();
    }));

    it('should fetch submission when submissionId is present in query params', fakeAsync(() => {
      (trustOnboardingApi.getTrustOnboardingSubmission as jest.Mock).mockReturnValue(of(MOCK_SUBMISSION));

      mockSnapshot.paramMap = convertToParamMap({submissionId: MOCK_SUBMISSION_ID, partnerId: 'org-123-abc'});
      tick();
      fixture.detectChanges();

      expect(trustOnboardingApi.getTrustOnboardingSubmission).toHaveBeenCalledWith({
        id: MOCK_SUBMISSION_ID
      });
      expect(service.submission()).toEqual(MOCK_SUBMISSION);
    }));
  });
});
