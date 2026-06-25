import {HttpErrorResponse, provideHttpClient} from '@angular/common/http';
import {HttpClientTestingModule, provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {ObliqueTestingModule} from '@oblique/oblique';
import {of, throwError} from 'rxjs';
import {
  BusinessPartner,
  PagedModelTrustOnboardingSubmissionDocumentListItem,
  TrustOnboardingDocumentsApi
} from '../../../../../api/generated';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {OnboardingStepDocumentsComponent} from './onboarding-step-documents.component';

describe('OnboardingStepDocumentsComponent', () => {
  let component: OnboardingStepDocumentsComponent;
  let fixture: ComponentFixture<OnboardingStepDocumentsComponent>;
  let documentsApi: TrustOnboardingDocumentsApi;

  const MOCK_SUBMISSION_ID = 'sub-123';
  const MOCK_DOCUMENTS: PagedModelTrustOnboardingSubmissionDocumentListItem = {
    content: [
      {
        id: 'doc-id-1',
        name: 'doc1.pdf',
        mediaType: 'application/pdf',
        type: 'TRUST_ONBOARDING_DECLARATION_OF_INTENT',
        owningBusinessPartner: '',
        trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
        createdAt: '',
        updatedAt: '',
        submittedAt: '',
        canBeDeleted: true
      },
      {
        id: 'doc-id-2',
        name: 'doc2.pdf',
        mediaType: 'application/pdf',
        type: 'TRUST_ONBOARDING_DECLARATION_OF_INTENT',
        owningBusinessPartner: '',
        trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
        createdAt: '',
        updatedAt: '',
        submittedAt: '',
        canBeDeleted: true
      }
    ]
  };

  beforeEach(async () => {
    const documentsApiSpy = {
      listAllDocumentsForTrustOnboarding: jest.fn(),
      uploadTrustOnboardingSubmissionDocument: jest.fn(),
      deleteTrustOnboardingSubmissionDocument: jest.fn()
    };

    const wizardServiceMock = {
      submissionId: MOCK_SUBMISSION_ID,
      partnerId: 'partner-001',
      submission: jest.fn().mockReturnValue(undefined),
      requestedBusinessPartnerType: jest.fn().mockReturnValue(undefined),
      submissionRequest: {},
      saveAndNext: jest.fn(),
      navigateToPreviousStep: jest.fn(),
      onSaveAndContinueLater: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        OnboardingStepDocumentsComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        ObliqueTestingModule,
        TranslateModule.forRoot(),
        MatIconTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        {provide: TrustOnboardingDocumentsApi, useValue: documentsApiSpy},
        {provide: TrustOnboardingWizardService, useValue: wizardServiceMock},
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingStepDocumentsComponent);
    component = fixture.componentInstance;
    documentsApi = TestBed.inject(TrustOnboardingDocumentsApi);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should not call listAllDocumentsForTrustOnboarding if submissionId is not provided', () => {
      const wizardService = TestBed.inject(TrustOnboardingWizardService);
      (wizardService as TrustOnboardingWizardService).submissionId = '';
      fixture.detectChanges();
      expect(documentsApi.listAllDocumentsForTrustOnboarding).not.toHaveBeenCalled();
    });

    it('should populate uploadedFiles with id, name, and canBeDeleted from API response', fakeAsync(() => {
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));

      fixture.detectChanges();
      tick();

      expect(documentsApi.listAllDocumentsForTrustOnboarding).toHaveBeenCalledWith({
        id: MOCK_SUBMISSION_ID,
        size: 50,
        page: 0,
        sort: ['createdAt,desc']
      });
      expect(component.form.controls.uploadedFiles.value).toEqual([
        {id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true},
        {id: 'doc-id-2', name: 'doc2.pdf', canBeDeleted: true}
      ]);
    }));

    it('should preserve canBeDeleted flag for documents already sent to TMS', fakeAsync(() => {
      const docsWithMixedDeletability: PagedModelTrustOnboardingSubmissionDocumentListItem = {
        content: [
          {
            id: 'doc-id-1',
            name: 'doc1.pdf',
            mediaType: 'application/pdf',
            type: 'TRUST_ONBOARDING_DECLARATION_OF_INTENT',
            owningBusinessPartner: '',
            trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
            createdAt: '',
            updatedAt: '',
            submittedAt: '2024-01-01T00:00:00Z',
            canBeDeleted: false
          },
          {
            id: 'doc-id-2',
            name: 'doc2.pdf',
            mediaType: 'application/pdf',
            type: 'TRUST_ONBOARDING_DECLARATION_OF_INTENT',
            owningBusinessPartner: '',
            trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
            createdAt: '',
            updatedAt: '',
            submittedAt: '',
            canBeDeleted: true
          }
        ]
      };
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(docsWithMixedDeletability));

      fixture.detectChanges();
      tick();

      expect(component.form.controls.uploadedFiles.value).toEqual([
        {id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: false},
        {id: 'doc-id-2', name: 'doc2.pdf', canBeDeleted: true}
      ]);
    }));

    it('should filter out documents with missing id or name', fakeAsync(() => {
      const docsWithMissing = {
        content: [
          {
            id: 'doc-id-1',
            name: 'doc1.pdf',
            mediaType: 'application/pdf',
            type: 'TRUST_ONBOARDING_DECLARATION_OF_INTENT',
            owningBusinessPartner: '',
            trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
            createdAt: '',
            updatedAt: '',
            submittedAt: '',
            canBeDeleted: true
          },
          // simulate unexpected API responses with missing fields
          {id: undefined, name: 'no-id.pdf'},
          {id: 'doc-id-3', name: undefined}
        ]
      } as unknown as PagedModelTrustOnboardingSubmissionDocumentListItem;
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(docsWithMissing));

      fixture.detectChanges();
      tick();

      expect(component.form.controls.uploadedFiles.value).toEqual([
        {id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true}
      ]);
    }));
  });

  describe('onFileChosen', () => {
    it('should upload and reload documents from API on success', fakeAsync(() => {
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of({content: []}));
      fixture.detectChanges();
      tick();
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockClear();

      (documentsApi.uploadTrustOnboardingSubmissionDocument as jest.Mock).mockReturnValue(of(undefined));
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));
      const file = new File([''], 'new-doc.pdf');
      component.onFileChosen(file);
      tick();

      expect(documentsApi.uploadTrustOnboardingSubmissionDocument).toHaveBeenCalledWith({
        file,
        id: MOCK_SUBMISSION_ID
      });
      expect(documentsApi.listAllDocumentsForTrustOnboarding).toHaveBeenCalledTimes(1);
      expect(component.form.controls.uploadedFiles.value).toEqual([
        {id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true},
        {id: 'doc-id-2', name: 'doc2.pdf', canBeDeleted: true}
      ]);
    }));

    it('should set upload errors and not reload documents on upload failure', fakeAsync(() => {
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of({content: []}));
      fixture.detectChanges();
      tick();
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockClear();

      (documentsApi.uploadTrustOnboardingSubmissionDocument as jest.Mock).mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              error: {additionalDetails: ['no_signatures_found']}
            })
        )
      );

      component.onFileChosen(new File([''], 'new-doc.pdf'));
      tick();

      expect(documentsApi.listAllDocumentsForTrustOnboarding).not.toHaveBeenCalled();
      expect(component.form.controls.uploadedFiles.errors).toEqual({
        no_signatures_found: 'eportal_onboardingTR_formalProof_declaration_of_intent_error_no_signatures_found'
      });
    }));
  });

  describe('deleteDocument', () => {
    it('should call delete API and remove document from form', fakeAsync(() => {
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));
      fixture.detectChanges();
      tick();

      (documentsApi.deleteTrustOnboardingSubmissionDocument as jest.Mock).mockReturnValue(of(undefined));
      component.deleteDocument({id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true});
      tick();

      expect(documentsApi.deleteTrustOnboardingSubmissionDocument).toHaveBeenCalledWith({
        id: MOCK_SUBMISSION_ID,
        documentId: 'doc-id-1'
      });
      expect(component.form.controls.uploadedFiles.value).toEqual([
        {id: 'doc-id-2', name: 'doc2.pdf', canBeDeleted: true}
      ]);
    }));

    it('should not call delete API if submissionId is not set', () => {
      const wizardService = TestBed.inject(TrustOnboardingWizardService);
      (wizardService as TrustOnboardingWizardService).submissionId = '';

      component.deleteDocument({id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true});

      expect(documentsApi.deleteTrustOnboardingSubmissionDocument).not.toHaveBeenCalled();
    });

    it('should mark form invalid after last document is deleted', fakeAsync(() => {
      const singleDoc: PagedModelTrustOnboardingSubmissionDocumentListItem = {
        content: [
          {
            id: 'doc-id-1',
            name: 'doc1.pdf',
            mediaType: 'application/pdf',
            type: 'TRUST_ONBOARDING_DECLARATION_OF_INTENT',
            owningBusinessPartner: '',
            trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
            createdAt: '',
            updatedAt: '',
            submittedAt: '',
            canBeDeleted: true
          }
        ]
      };
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(singleDoc));
      fixture.detectChanges();
      tick();

      (documentsApi.deleteTrustOnboardingSubmissionDocument as jest.Mock).mockReturnValue(of(undefined));
      component.deleteDocument({id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true});
      tick();

      expect(component.form.controls.uploadedFiles.value).toEqual([]);
      expect(component.form.invalid).toBe(true);
    }));

    it('should reload documents from API on delete error', fakeAsync(() => {
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));
      fixture.detectChanges();
      tick();
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockClear();

      (documentsApi.deleteTrustOnboardingSubmissionDocument as jest.Mock).mockReturnValue(
        throwError(() => new Error('Server error'))
      );
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));
      component.deleteDocument({id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true});
      tick();

      expect(documentsApi.listAllDocumentsForTrustOnboarding).toHaveBeenCalledTimes(1);
    }));
  });

  describe('form validation', () => {
    it('should be invalid if uploadedFiles is empty', () => {
      component.form.controls.uploadedFiles.setValue([]);
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid if uploadedFiles has at least one document', () => {
      component.form.controls.uploadedFiles.setValue([{id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true}]);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('validate', () => {
    it('should return true if form is valid', async () => {
      component.form.controls.uploadedFiles.setValue([{id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true}]);
      const result = await component.validate();
      expect(result).toBe(true);
    });

    it('should return false and mark form as touched if form is invalid', async () => {
      component.form.controls.uploadedFiles.setValue([]);
      const result = await component.validate();
      expect(result).toBe(false);
      expect(component.form.controls.uploadedFiles.touched).toBe(true);
    });
  });

  describe('additional documents (BUSINESS without UID)', () => {
    const showSection = () => {
      const wizardService = TestBed.inject(TrustOnboardingWizardService);
      (wizardService.requestedBusinessPartnerType as unknown as jest.Mock).mockReturnValue(
        BusinessPartner.TypeEnum.Business
      );
      (wizardService.submission as unknown as jest.Mock).mockReturnValue({isRegisteredInCommercialRegister: false});
    };

    const otherDoc = (id: string, name: string) => ({
      id,
      name,
      mediaType: 'image/png',
      type: 'TRUST_ONBOARDING_OTHER',
      owningBusinessPartner: '',
      trustOnboardingSubmissionId: MOCK_SUBMISSION_ID,
      createdAt: '',
      updatedAt: '',
      submittedAt: '',
      canBeDeleted: true
    });

    it('should split loaded documents into declaration-of-intent and other documents', fakeAsync(() => {
      showSection();
      const mixedDocs = {
        content: [MOCK_DOCUMENTS.content![0], otherDoc('doc-other-1', 'statutes.png')]
      } as unknown as PagedModelTrustOnboardingSubmissionDocumentListItem;
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(mixedDocs));

      fixture.detectChanges();
      tick();

      expect(component.form.controls.uploadedFiles.value).toEqual([
        {id: 'doc-id-1', name: 'doc1.pdf', canBeDeleted: true}
      ]);
      expect(component.form.controls.otherDocuments.value).toEqual([
        {id: 'doc-other-1', name: 'statutes.png', canBeDeleted: true}
      ]);
    }));

    it('should require at least one additional document when the section is shown', fakeAsync(() => {
      showSection();
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(
        of({content: [MOCK_DOCUMENTS.content![0]]} as unknown as PagedModelTrustOnboardingSubmissionDocumentListItem)
      );

      fixture.detectChanges();
      tick();

      expect(component.showAdditionalDocuments()).toBe(true);
      // declaration of intent present but no additional document yet
      expect(component.form.invalid).toBe(true);

      component.form.controls.otherDocuments.setValue([{id: 'doc-other-1', name: 'statutes.png', canBeDeleted: true}]);
      expect(component.form.valid).toBe(true);
    }));

    it('should not show or require additional documents for other partner types', fakeAsync(() => {
      const wizardService = TestBed.inject(TrustOnboardingWizardService);
      (wizardService.requestedBusinessPartnerType as unknown as jest.Mock).mockReturnValue(
        BusinessPartner.TypeEnum.Individual
      );
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));

      fixture.detectChanges();
      tick();

      expect(component.showAdditionalDocuments()).toBe(false);
      expect(component.form.valid).toBe(true);
    }));

    it('should not show the section for a BUSINESS partner that is registered in the commercial register', fakeAsync(() => {
      const wizardService = TestBed.inject(TrustOnboardingWizardService);
      (wizardService.requestedBusinessPartnerType as unknown as jest.Mock).mockReturnValue(
        BusinessPartner.TypeEnum.Business
      );
      (wizardService.submission as unknown as jest.Mock).mockReturnValue({isRegisteredInCommercialRegister: true});
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(of(MOCK_DOCUMENTS));

      fixture.detectChanges();
      tick();

      expect(component.showAdditionalDocuments()).toBe(false);
      expect(component.form.valid).toBe(true);
    }));

    it('should show and require additional documents for a GOVERNMENTAL_INSTITUTION partner regardless of registration', fakeAsync(() => {
      const wizardService = TestBed.inject(TrustOnboardingWizardService);
      (wizardService.requestedBusinessPartnerType as unknown as jest.Mock).mockReturnValue(
        BusinessPartner.TypeEnum.GovernmentalInstitution
      );
      (wizardService.submission as unknown as jest.Mock).mockReturnValue({isRegisteredInCommercialRegister: true});
      (documentsApi.listAllDocumentsForTrustOnboarding as jest.Mock).mockReturnValue(
        of({content: [MOCK_DOCUMENTS.content![0]]} as unknown as PagedModelTrustOnboardingSubmissionDocumentListItem)
      );

      fixture.detectChanges();
      tick();

      expect(component.showAdditionalDocuments()).toBe(true);
      // declaration of intent present but no additional document yet
      expect(component.form.invalid).toBe(true);

      component.form.controls.otherDocuments.setValue([{id: 'doc-other-1', name: 'statutes.png', canBeDeleted: true}]);
      expect(component.form.valid).toBe(true);
    }));
  });
});
