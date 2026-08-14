import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {
  BusinessPartnerApi,
  ProtectedVerificationSubmission,
  ProtectedVerificationSubmissionApi
} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';
import {AbstractOnboardingStepComponent} from '../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {ProtectedVerificationWizardService} from './protected-verification-wizard.service';

describe('ProtectedVerificationWizardService', () => {
  let service: ProtectedVerificationWizardService;
  let routerNavigateMock: jest.Mock;
  let createSubmissionMock: jest.Mock;
  let getBusinessPartnerMock: jest.Mock;
  let getCategoriesMock: jest.Mock;

  const submission: ProtectedVerificationSubmission = {
    id: 'pv-1',
    partnerId: 'partner-001',
    sbnId: 'sbn-1',
    entityName: 'Test Corp',
    category: ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber,
    reason: 'reason',
    status: ProtectedVerificationSubmission.StatusEnum.Submitted
  };

  const makeStep = (valid: boolean): AbstractOnboardingStepComponent =>
    ({
      validate: jest.fn().mockResolvedValue(valid),
      isValid: jest.fn().mockReturnValue(valid)
    }) as unknown as AbstractOnboardingStepComponent;

  beforeEach(() => {
    routerNavigateMock = jest.fn().mockResolvedValue(true);
    createSubmissionMock = jest.fn();
    getBusinessPartnerMock = jest
      .fn()
      .mockReturnValue(of({id: 'partner-001', name: 'Test Corp', uid: 'CHE-123.456.789'}));
    getCategoriesMock = jest
      .fn()
      .mockReturnValue(of([ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber]));

    TestBed.configureTestingModule({
      providers: [
        ProtectedVerificationWizardService,
        {provide: Router, useValue: {navigate: routerNavigateMock}},
        {
          provide: ProtectedVerificationSubmissionApi,
          useValue: {
            createProtectedVerificationSubmission: createSubmissionMock,
            getProtectedVerificationCategories: getCategoriesMock
          }
        },
        {provide: BusinessPartnerApi, useValue: {getBusinessPartner: getBusinessPartnerMock}}
      ]
    });

    service = TestBed.inject(ProtectedVerificationWizardService);
  });

  describe('init', () => {
    it('fetches the business partner and available categories', () => {
      service.init('partner-001');

      expect(getBusinessPartnerMock).toHaveBeenCalledWith({businessPartnerId: 'partner-001'});
      expect(getCategoriesMock).toHaveBeenCalled();
      expect(service.businessPartner()).toEqual({id: 'partner-001', name: 'Test Corp', uid: 'CHE-123.456.789'});
      expect(service.categories()).toEqual([ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber]);
      expect(service.partnerId).toBe('partner-001');
    });
  });

  describe('submitAndNext', () => {
    beforeEach(() => {
      service.init('partner-001');
      service.updateFormValue({
        category: ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber,
        sbnId: 'sbn-1',
        reason: 'reason'
      });
    });

    it('creates the submission and navigates to the next step when the active step is valid', async () => {
      service.setActiveStep(makeStep(true));
      createSubmissionMock.mockReturnValue(of(submission));

      service.submitAndNext();
      await new Promise(resolve => setTimeout(resolve));

      expect(createSubmissionMock).toHaveBeenCalledWith({
        protectedVerificationSubmissionRequest: {
          partnerId: 'partner-001',
          sbnId: 'sbn-1',
          entityName: '',
          uid: 'CHE-123.456.789',
          category: ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber,
          reason: 'reason'
        }
      });
      expect(service.submission()).toEqual(submission);
      expect(routerNavigateMock).toHaveBeenCalledWith([
        ...AppRoutes.protectedVerificationWizard('partner-001'),
        'confirmation'
      ]);
    });

    it('does not create a submission when the active step is invalid', () => {
      service.setActiveStep(makeStep(false));

      service.submitAndNext();

      expect(createSubmissionMock).not.toHaveBeenCalled();
      expect(routerNavigateMock).not.toHaveBeenCalled();
    });

    it('does nothing when there is no active step', () => {
      service.setActiveStep(null);

      service.submitAndNext();

      expect(createSubmissionMock).not.toHaveBeenCalled();
      expect(routerNavigateMock).not.toHaveBeenCalled();
    });
  });

  describe('navigateToOverview', () => {
    it('navigates to the overview route for the current partner', () => {
      service.init('partner-001');

      service.navigateToOverview();

      expect(routerNavigateMock).toHaveBeenCalledWith(AppRoutes.protectedVerificationOverview('partner-001'));
    });
  });
});
