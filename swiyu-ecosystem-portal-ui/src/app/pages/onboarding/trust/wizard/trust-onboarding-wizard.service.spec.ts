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
import {TrustOnboardingFlow, TrustStepId} from './trust-onboarding-flow.config';
import {TrustOnboardingWizardService} from './trust-onboarding-wizard.service';

describe('TrustOnboardingWizardService', () => {
  let service: TrustOnboardingWizardService;
  let routerNavigateMock: jest.Mock;
  let updateSubmissionMock: jest.Mock;
  let getSubmissionMock: jest.Mock;
  let getBusinessPartnerMock: jest.Mock;
  let appConfigServiceMock: {isFunctionalityAutomaticApprovalEnabled: boolean};

  const submissionRequest: TrustOnboardingSubmissionRequest = {
    partnerId: 'partner-001',
    entityName: {default: 'Test Corp', 'de-CH': 'Test Corp'},
    entityEmail: 'contact@test.com'
  };

  const updatedSubmission = {
    id: 'sub-123',
    status: 'UNSUBMITTED',
    partnerId: 'partner-001',
    registryIds: {},
    proofOfPossessionList: []
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
    appConfigServiceMock = {isFunctionalityAutomaticApprovalEnabled: false};

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
          useValue: appConfigServiceMock
        }
      ]
    });

    service = TestBed.inject(TrustOnboardingWizardService);
    service.submissionId = 'sub-123';
    service.partnerId = 'partner-001';
    service.submissionRequest = {...submissionRequest};
  });

  // Replaces the flow-derived step list so navigation can be tested with hidden steps.
  const stubVisibleSteps = (ids: TrustStepId[]): void => {
    Object.defineProperty(service, 'visibleSteps', {
      value: () => ids.map(id => ({id, visible: true, labelKey: `label_${id}`}))
    });
  };

  const flushMicrotasks = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0));

  describe('flow configuration', () => {
    it('defaults to the registration flow', () => {
      expect(service.flow()).toBe(TrustOnboardingFlow.Registration);
      expect(service.config().flow).toBe(TrustOnboardingFlow.Registration);
    });

    it('takes over the flow passed to init', () => {
      getSubmissionMock.mockReturnValue(of(updatedSubmission));

      service.init('partner-001', 'sub-123', TrustOnboardingFlow.Renewal);

      expect(service.flow()).toBe(TrustOnboardingFlow.Renewal);
    });

    it('exposes the visible steps of the active flow', () => {
      expect(service.visibleSteps().map(step => step.id)).toEqual([
        'profile',
        'dids',
        'formal-proof',
        'technical-proof',
        'approval'
      ]);
    });

    it('labels the approval step for manual approval by default', () => {
      expect(service.visibleSteps()[4].labelKey).toBe('app_site_onboarding_trust_final_step');
    });

    it('labels the approval step for automatic approval when the functionality is enabled', () => {
      appConfigServiceMock.isFunctionalityAutomaticApprovalEnabled = true;

      expect(service.visibleSteps()[4].labelKey).toBe('eportal_site_onboarding_trust_final_automatic_step');
    });

    it('reports step, field and notification configuration', () => {
      expect(service.isStepVisible('dids')).toBe(true);
      expect(service.fieldState('uid')).toEqual({visible: true, editable: true});
      expect(service.isFieldVisible('uid')).toBe(true);
      expect(service.isFieldEditable('uid')).toBe(true);
      expect(service.isNotificationVisible('profileAutoApprovalWarning')).toBe(true);
    });

    it('treats a visible but non-editable field as not editable', () => {
      jest.spyOn(service, 'fieldState').mockReturnValue({visible: true, editable: false});

      expect(service.isFieldVisible('uid')).toBe(true);
      expect(service.isFieldEditable('uid')).toBe(false);
    });
  });

  describe('navigation', () => {
    it('navigates to the next visible step, skipping hidden ones', async () => {
      stubVisibleSteps(['profile', 'formal-proof', 'approval']);
      service.currentStepIndex.set(0);
      service.setActiveStep(makeStep(true));
      updateSubmissionMock.mockReturnValue(of(updatedSubmission));

      service.saveAndNext();
      await flushMicrotasks();

      expect(routerNavigateMock).toHaveBeenCalledWith([
        ...AppRoutes.trustOnboardingWizard('partner-001', 'sub-123'),
        'formal-proof'
      ]);
    });

    it('navigates to the previous visible step, skipping hidden ones', () => {
      stubVisibleSteps(['profile', 'formal-proof', 'approval']);
      service.currentStepIndex.set(2);

      service.navigateToPreviousStep();

      expect(routerNavigateMock).toHaveBeenCalledWith([
        ...AppRoutes.trustOnboardingWizard('partner-001', 'sub-123'),
        'formal-proof'
      ]);
    });

    it('does not navigate past the last visible step', async () => {
      stubVisibleSteps(['profile', 'formal-proof', 'approval']);
      service.currentStepIndex.set(2);
      service.setActiveStep(makeStep(true));

      service.submit();
      await flushMicrotasks();

      expect(routerNavigateMock).not.toHaveBeenCalled();
    });
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
