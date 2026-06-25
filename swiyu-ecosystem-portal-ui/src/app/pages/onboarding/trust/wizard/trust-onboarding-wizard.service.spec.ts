import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {
  BusinessPartnerApi,
  TrustOnboardingApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionRequest
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {AbstractOnboardingStepComponent} from '../steps/abstract-onboarding-step-component';
import {TrustOnboardingWizardService} from './trust-onboarding-wizard.service';

describe('TrustOnboardingWizardService', () => {
  let service: TrustOnboardingWizardService;
  let routerNavigateMock: jest.Mock;
  let updateSubmissionMock: jest.Mock;
  let getSubmissionMock: jest.Mock;
  let getBusinessPartnerMock: jest.Mock;

  const submissionRequest: TrustOnboardingSubmissionRequest = {
    partnerId: 'partner-001',
    entityName: {de: 'Test Corp'},
    entityEmail: 'contact@test.com'
  };

  const updatedSubmission = {
    id: 'sub-123',
    status: 'UNSUBMITTED',
    partnerId: 'partner-001'
  } as unknown as TrustOnboardingSubmission;

  const makeStep = (valid: boolean): AbstractOnboardingStepComponent =>
    ({
      validate: jest.fn().mockResolvedValue(valid),
      isValid: jest.fn().mockReturnValue(valid)
    }) as unknown as AbstractOnboardingStepComponent;

  beforeEach(() => {
    routerNavigateMock = jest.fn().mockResolvedValue(true);
    updateSubmissionMock = jest.fn();
    getSubmissionMock = jest.fn();
    getBusinessPartnerMock = jest.fn().mockReturnValue(of({id: 'partner-001', name: 'Test Corp'}));

    TestBed.configureTestingModule({
      providers: [
        TrustOnboardingWizardService,
        {provide: Router, useValue: {navigate: routerNavigateMock}},
        {
          provide: TrustOnboardingApi,
          useValue: {
            getTrustOnboardingSubmission: getSubmissionMock,
            updateTrustOnboardingSubmission: updateSubmissionMock
          }
        },
        {
          provide: BusinessPartnerApi,
          useValue: {getBusinessPartner: getBusinessPartnerMock}
        },
        {
          provide: AppConfigService,
          useValue: {}
        }
      ]
    });

    service = TestBed.inject(TrustOnboardingWizardService);
    service.submissionId = 'sub-123';
    service.partnerId = 'partner-001';
    service.submissionRequest = {...submissionRequest};
  });

  describe('onSaveAndContinueLater', () => {
    it('saves submission and navigates to overview when form is valid', () => {
      service.setActiveStep(makeStep(true));
      updateSubmissionMock.mockReturnValue(of(updatedSubmission));

      service.onSaveAndContinueLater();

      expect(updateSubmissionMock).toHaveBeenCalledWith({
        id: 'sub-123',
        trustOnboardingSubmissionRequest: submissionRequest
      });
      expect(service.submission()).toEqual(updatedSubmission);
      expect(routerNavigateMock).toHaveBeenCalledWith(AppRoutes.businessPartnerOverviewV2());
    });

    it('does not navigate when save API fails', () => {
      service.setActiveStep(makeStep(true));
      updateSubmissionMock.mockReturnValue(throwError(() => new Error('save failed')));

      service.onSaveAndContinueLater();

      expect(updateSubmissionMock).toHaveBeenCalled();
      expect(routerNavigateMock).not.toHaveBeenCalled();
    });

    it('navigates without saving when form is invalid', () => {
      service.setActiveStep(makeStep(false));

      service.onSaveAndContinueLater();

      expect(updateSubmissionMock).not.toHaveBeenCalled();
      expect(routerNavigateMock).toHaveBeenCalledWith(AppRoutes.businessPartnerOverviewV2());
    });

    it('does nothing when there is no active step', () => {
      service.setActiveStep(null);

      service.onSaveAndContinueLater();

      expect(updateSubmissionMock).not.toHaveBeenCalled();
      expect(routerNavigateMock).not.toHaveBeenCalled();
    });
  });
});
