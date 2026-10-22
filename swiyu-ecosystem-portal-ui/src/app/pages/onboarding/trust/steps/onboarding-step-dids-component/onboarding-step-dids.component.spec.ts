import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
import {TranslateModule} from '@ngx-translate/core';
import {WINDOW} from '@oblique/oblique';
import {Subject} from 'rxjs';

import {provideHttpClient} from '@angular/common/http';
import {signal} from '@angular/core';
import {IdentifierApi, IdentifierResponse, PagedModelIdentifierResponse} from '../../../../../api/generated';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {OnboardingStepDidsComponent} from './onboarding-step-dids.component';

describe('OnboardingStepDidsComponent', () => {
  const availableDids: IdentifierResponse[] = [
    {id: 'id-1', did: 'did:key:123', description: 'First DID'},
    {id: 'id-2', did: 'did:key:456', description: 'Second DID'}
  ];

  let component: OnboardingStepDidsComponent;
  let fixture: ComponentFixture<OnboardingStepDidsComponent>;
  let identifierResponse$: Subject<PagedModelIdentifierResponse>;
  let wizardServiceMock: {
    isFieldVisible: jest.Mock;
    isFieldEditable: jest.Mock;
    isNotificationVisible: jest.Mock;
    fieldState: jest.Mock;
    updateDidSelection: jest.Mock;
    [key: string]: unknown;
  };

  /**
   * Initializes the component and emits the identifiers afterwards, mirroring the async API response.
   * The second change detection lets the effect create one checkbox control per available DID before
   * the table renders the rows.
   */
  const initComponentWithDids = (dids: IdentifierResponse[] = availableDids): void => {
    fixture.detectChanges();
    identifierResponse$.next({content: dids});
    fixture.detectChanges();
  };

  beforeEach(async () => {
    identifierResponse$ = new Subject<PagedModelIdentifierResponse>();
    wizardServiceMock = {
      partnerId: 'test-partner-id',
      submissionId: 'sub-123',
      submission: signal(undefined),
      submissionRequest: {},
      isFieldVisible: jest.fn().mockReturnValue(true),
      isFieldEditable: jest.fn().mockReturnValue(true),
      isNotificationVisible: jest.fn().mockReturnValue(true),
      fieldState: jest.fn().mockReturnValue({visible: true, editable: true}),
      updateDidSelection: jest.fn(),
      saveAndNext: jest.fn(),
      navigateToPreviousStep: jest.fn(),
      onSaveAndContinueLater: jest.fn()
    };

    const identifierApiSpy = {
      getAllIdentifiersOfPartner: jest.fn().mockReturnValue(identifierResponse$.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [
        OnboardingStepDidsComponent,
        ReactiveFormsModule,
        MatTableModule,
        MatCheckboxModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {provide: TrustOnboardingWizardService, useValue: wizardServiceMock},
        {provide: IdentifierApi, useValue: identifierApiSpy},
        {provide: WINDOW, useValue: window}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingStepDidsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Flow configuration', () => {
    it('hides the DID table when the flow does not show the selection', () => {
      wizardServiceMock.isFieldVisible.mockReturnValue(false);
      wizardServiceMock.fieldState.mockReturnValue({visible: false, editable: false});

      initComponentWithDids();

      expect(fixture.nativeElement.querySelector('[data-cy="tablDid"]')).toBeNull();
      expect(component.form.controls.didCheckboxes.disabled).toBe(true);
    });

    it('disables the selection when the flow marks it as not editable', () => {
      wizardServiceMock.fieldState.mockReturnValue({visible: true, editable: false});

      initComponentWithDids();

      expect(fixture.nativeElement.querySelector('[data-cy="tablDid"]')).not.toBeNull();
      expect(component.form.controls.didCheckboxes.disabled).toBe(true);
      expect(component.form.controls.didCheckboxes.at(0).disabled).toBe(true);
    });
  });

  describe('Initialization and Input Handling', () => {
    it('should start without any checkbox control', () => {
      fixture.detectChanges();

      expect(component.availableDids()).toHaveLength(0);
      expect(component.form.controls.didCheckboxes.length).toBe(0);
    });

    it('should create one unchecked checkbox control per available DID', () => {
      initComponentWithDids();

      expect(component.availableDids()).toHaveLength(2);
      expect(component.form.controls.didCheckboxes.length).toBe(2);
      expect(component.form.controls.didCheckboxes.value).toEqual([false, false]);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      initComponentWithDids();
    });

    it('should be invalid when no DID is selected', () => {
      expect(component.form.controls.didCheckboxes.hasError('required')).toBe(true);
      expect(component.form.valid).toBe(false);
      expect(component.isValid()).toBe(false);
    });

    it('should be valid when at least one DID is selected', () => {
      component.form.controls.didCheckboxes.at(0).setValue(true);
      fixture.detectChanges();

      expect(component.form.controls.didCheckboxes.hasError('required')).toBe(false);
      expect(component.form.valid).toBe(true);
      expect(component.isValid()).toBe(true);
    });
  });

  describe('DID selection', () => {
    beforeEach(() => {
      initComponentWithDids();
      wizardServiceMock.updateDidSelection.mockClear();
    });

    it('should report the selected DID when a checkbox is checked', () => {
      component.form.controls.didCheckboxes.at(0).setValue(true);

      expect(wizardServiceMock.updateDidSelection).toHaveBeenLastCalledWith(['did:key:123']);
    });

    it('should report the remaining DID when a checkbox is unchecked', () => {
      component.form.controls.didCheckboxes.setValue([true, true]);
      expect(wizardServiceMock.updateDidSelection).toHaveBeenLastCalledWith(['did:key:123', 'did:key:456']);

      component.form.controls.didCheckboxes.at(0).setValue(false);

      expect(wizardServiceMock.updateDidSelection).toHaveBeenLastCalledWith(['did:key:456']);
    });

    it('should correctly handle multiple additions and removals', () => {
      component.form.controls.didCheckboxes.at(0).setValue(true);
      expect(wizardServiceMock.updateDidSelection).toHaveBeenLastCalledWith(['did:key:123']);

      component.form.controls.didCheckboxes.at(1).setValue(true);
      expect(wizardServiceMock.updateDidSelection).toHaveBeenLastCalledWith(['did:key:123', 'did:key:456']);

      component.form.controls.didCheckboxes.at(0).setValue(false);
      expect(wizardServiceMock.updateDidSelection).toHaveBeenLastCalledWith(['did:key:456']);
    });
  });
});
