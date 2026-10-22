import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideRouter, Router} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {provideOAuthClient} from 'angular-oauth2-oidc';
import {of} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  TrustOnboardingApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionRequest
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {RenewalIntroductionComponent, RenewalOption} from './renewal-introduction.component';

describe('RenewalIntroductionComponent', () => {
  let fixture: ComponentFixture<RenewalIntroductionComponent>;
  let component: RenewalIntroductionComponent;
  let componentApi: {
    onCardSelect: (option: RenewalOption) => void;
    startRenewalOrProfileChangeMandatory: () => void;
  };
  let routerNavigateMock: jest.SpyInstance;
  let createSubmissionMock: jest.Mock;

  beforeEach(async () => {
    createSubmissionMock = jest.fn().mockReturnValue(
      of({
        id: 'submission-123'
      } as unknown as TrustOnboardingSubmission)
    );

    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, RenewalIntroductionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        provideObliqueTestingConfiguration(),
        provideOAuthClient(),
        provideRouter([]),
        {
          provide: TrustOnboardingApi,
          useValue: {
            createTrustOnboardingSubmission: createSubmissionMock
          }
        },
        {
          provide: BusinessPartnerApi,
          useValue: {
            getBusinessPartner: jest
              .fn()
              .mockReturnValue(of({entityName: {default: 'ACME'}} as unknown as BusinessPartner))
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewalIntroductionComponent);
    component = fixture.componentInstance;
    componentApi = component as unknown as typeof componentApi;
    routerNavigateMock = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentRef.setInput('businessPartnerId', 'partner-001');
    fixture.detectChanges();
  });

  it('reveals the up-to-date process, then creates a renewal submission and navigates to the renewal wizard', () => {
    componentApi.onCardSelect(RenewalOption.Renewal);
    componentApi.startRenewalOrProfileChangeMandatory();

    expect(component['visibleProcessSection']()).toBe(RenewalOption.Renewal);
    expect(createSubmissionMock).not.toHaveBeenCalled();

    componentApi.startRenewalOrProfileChangeMandatory();

    expect(createSubmissionMock).toHaveBeenCalledWith({
      trustOnboardingSubmissionRequest: {
        partnerId: 'partner-001',
        submissionType: TrustOnboardingSubmissionRequest.SubmissionTypeEnum.Renewal
      }
    });
    expect(routerNavigateMock).toHaveBeenCalledWith(AppRoutes.trustOnboardingWizard('partner-001', 'submission-123'));
  });

  it('reveals the needs-update process, then creates a profile-change submission', () => {
    componentApi.onCardSelect(RenewalOption.ProfileChangeMandatory);
    componentApi.startRenewalOrProfileChangeMandatory();

    expect(component['visibleProcessSection']()).toBe(RenewalOption.ProfileChangeMandatory);
    expect(createSubmissionMock).not.toHaveBeenCalled();

    componentApi.startRenewalOrProfileChangeMandatory();

    expect(createSubmissionMock).toHaveBeenCalledWith({
      trustOnboardingSubmissionRequest: {
        partnerId: 'partner-001',
        submissionType: TrustOnboardingSubmissionRequest.SubmissionTypeEnum.ProfileChangeMandatory
      }
    });
  });

  it('does not start the renewal and shows an error when no card is selected', () => {
    componentApi.startRenewalOrProfileChangeMandatory();

    expect(createSubmissionMock).not.toHaveBeenCalled();
    expect(routerNavigateMock).not.toHaveBeenCalled();
    expect(component['renewalError']()).toBe(true);
  });

  it('clears the error when a card is selected', () => {
    componentApi.startRenewalOrProfileChangeMandatory();
    expect(component['renewalError']()).toBe(true);

    componentApi.onCardSelect(RenewalOption.ProfileChangeMandatory);

    expect(component['renewalError']()).toBe(false);
    expect(component['selectedRenewalOption']()).toBe(RenewalOption.ProfileChangeMandatory);
  });

  it('hides the revealed process when the selected renewal option changes', () => {
    componentApi.onCardSelect(RenewalOption.Renewal);
    componentApi.startRenewalOrProfileChangeMandatory();

    expect(component['visibleProcessSection']()).toBe(RenewalOption.Renewal);

    componentApi.onCardSelect(RenewalOption.ProfileChangeMandatory);

    expect(component['selectedRenewalOption']()).toBe(RenewalOption.ProfileChangeMandatory);
    expect(component['visibleProcessSection']()).toBeUndefined();
  });
});
