import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {of} from 'rxjs';
import {
  BusinessPartnerApi,
  ProtectedVerificationSubmission,
  ProtectedVerificationSubmissionApi
} from '../../../../../api/generated';
import {ProtectedVerificationWizardService} from '../../wizard/protected-verification-wizard.service';
import {ProtectedVerificationStepCategoryComponent} from './protected-verification-step-category.component';

describe('ProtectedVerificationStepCategoryComponent', () => {
  let component: ProtectedVerificationStepCategoryComponent;
  let fixture: ComponentFixture<ProtectedVerificationStepCategoryComponent>;
  let wizardService: ProtectedVerificationWizardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtectedVerificationStepCategoryComponent, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [
        provideObliqueTestingConfiguration(),
        ProtectedVerificationWizardService,
        {
          provide: ProtectedVerificationSubmissionApi,
          useValue: {
            getProtectedVerificationCategories: jest
              .fn()
              .mockReturnValue(of([ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber])),
            createProtectedVerificationSubmission: jest.fn()
          }
        },
        {
          provide: BusinessPartnerApi,
          useValue: {getBusinessPartner: jest.fn().mockReturnValue(of({id: 'partner-001'}))}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedVerificationStepCategoryComponent);
    component = fixture.componentInstance;
    wizardService = TestBed.inject(ProtectedVerificationWizardService);
    wizardService.init('partner-001');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults the category to the first available option', () => {
    expect(component['form'].controls.category.value).toBe(
      ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber
    );
  });

  it('form is invalid when sbnId and reason are empty', () => {
    expect(component['form'].valid).toBe(false);
  });

  it('form is invalid when sbnId is not a valid UUID', () => {
    component['form'].controls.sbnId.setValue('not-a-uuid');
    component['form'].controls.reason.setValue('A valid reason for the request.');
    expect(component['form'].valid).toBe(false);
  });

  it('form is valid with a proper UUID sbnId and a reason', () => {
    component['form'].controls.sbnId.setValue('550e8400-e29b-41d4-a716-446655440000');
    component['form'].controls.reason.setValue('A valid reason for the request.');
    expect(component['form'].valid).toBe(true);
  });

  describe('validate', () => {
    it('resolves false and touches controls when the form is invalid', async () => {
      const isValid = await component.validate();
      expect(isValid).toBe(false);
      expect(component['form'].controls.sbnId.touched).toBe(true);
    });

    it('resolves true and pushes the form value into the wizard service when valid', async () => {
      component['form'].controls.sbnId.setValue('550e8400-e29b-41d4-a716-446655440000');
      component['form'].controls.reason.setValue('A valid reason for the request.');

      const isValid = await component.validate();

      expect(isValid).toBe(true);
      expect(wizardService.formValue).toEqual({
        category: ProtectedVerificationSubmission.CategoryEnum.PersonalAdministrativeNumber,
        sbnId: '550e8400-e29b-41d4-a716-446655440000',
        reason: 'A valid reason for the request.'
      });
    });
  });

  it('cancel() navigates back to the overview', () => {
    const navigateSpy = jest.spyOn(wizardService, 'navigateToOverview');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('next() delegates to the wizard service', () => {
    const submitSpy = jest.spyOn(wizardService, 'submitAndNext');
    component.next();
    expect(submitSpy).toHaveBeenCalled();
  });
});
