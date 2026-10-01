import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCheckbox, MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
import {TranslateModule} from '@ngx-translate/core';
import {WINDOW} from '@oblique/oblique';
import {of} from 'rxjs';

import {provideHttpClient} from '@angular/common/http';
import {signal} from '@angular/core';
import {IdentifierApi} from '../../../../../api/generated';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {OnboardingStepDidsComponent} from './onboarding-step-dids.component';

describe('OnboardingStepDidsComponent', () => {
  let component: OnboardingStepDidsComponent;
  let fixture: ComponentFixture<OnboardingStepDidsComponent>;
  let wizardServiceMock: {
    isFieldVisible: jest.Mock;
    isFieldEditable: jest.Mock;
    isNotificationVisible: jest.Mock;
    fieldState: jest.Mock;
    [key: string]: unknown;
  };

  beforeEach(async () => {
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
      getAllIdentifiersOfPartner: jest.fn().mockReturnValue(of({content: []}))
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

      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-cy="tablDid"]')).toBeNull();
      expect(component.form.controls.dids.disabled).toBe(true);
    });

    it('disables the selection when the flow marks it as not editable', () => {
      wizardServiceMock.fieldState.mockReturnValue({visible: true, editable: false});

      fixture.detectChanges();

      expect(component.form.controls.dids.disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-cy="tablDid"]')).not.toBeNull();
    });
  });

  describe('Initialization and Input Handling', () => {
    it('should initialize the form with an empty `dids` array', () => {
      fixture.detectChanges();

      expect(component.form).toBeDefined();
      expect(component.form.get('dids')).toBeDefined();
      expect(component.form.get('dids')?.value).toEqual([]);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should be valid when at least one DID is selected', () => {
      component.form.get('dids')?.setValue(['did:key:123']);
      fixture.detectChanges();

      expect(component.form.valid).toBe(true);
    });
  });

  describe('toggleDid Method', () => {
    it('should ADD a DID to the form control when a checkbox is checked', () => {
      // Ensure the form is initially empty
      expect(component.form.get('dids')?.value).toEqual([]);

      // Create a mock event object for a checkbox being checked
      const mockEvent = {
        source: {
          value: 'did:key:123',
          checked: true
        } as MatCheckbox,
        checked: true
      } as MatCheckboxChange;

      // Act: call the method
      component.toggleDid(mockEvent);

      // Assert: the DID was added to the form's value
      expect(component.form.get('dids')?.value).toEqual(['did:key:123']);
    });

    it('should REMOVE a DID from the form control when a checkbox is unchecked', () => {
      // Arrange: start with a DID already in the form
      component.form.get('dids')?.setValue(['did:key:123', 'did:key:456']);

      // Create a mock event object for a checkbox being unchecked
      const mockEvent = {
        source: {
          value: 'did:key:123',
          checked: false
        } as MatCheckbox,
        checked: false
      } as MatCheckboxChange;

      // Act: call the method
      component.toggleDid(mockEvent);

      // Assert: the correct DID was removed from the form's value
      expect(component.form.get('dids')?.value).toEqual(['did:key:456']);
    });

    it('should correctly handle multiple additions and removals', () => {
      // Check first DID
      component.toggleDid({
        source: {
          value: 'did:key:123',
          checked: true
        } as MatCheckbox,
        checked: true
      } as MatCheckboxChange);
      expect(component.form.get('dids')?.value).toEqual(['did:key:123']);

      // Check second DID
      component.toggleDid({
        source: {
          value: 'did:key:456',
          checked: true
        } as MatCheckbox,
        checked: true
      } as MatCheckboxChange);
      expect(component.form.get('dids')?.value).toEqual(['did:key:123', 'did:key:456']);

      // Uncheck first DID
      component.toggleDid({
        source: {
          value: 'did:key:123',
          checked: false
        } as MatCheckbox,
        checked: false
      } as MatCheckboxChange);
      expect(component.form.get('dids')?.value).toEqual(['did:key:456']);
    });
  });
});
