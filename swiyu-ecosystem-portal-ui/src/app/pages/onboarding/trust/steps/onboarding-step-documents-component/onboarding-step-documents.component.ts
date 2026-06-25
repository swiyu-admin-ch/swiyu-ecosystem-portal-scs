import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Component, computed, DestroyRef, effect, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatError} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ObButtonDirective, ObMatErrorDirective, ObUnsavedChangesDirective} from '@oblique/oblique';
import {EMPTY, Subject, switchMap, timer} from 'rxjs';
import {
  BusinessPartner,
  GetDeclarationOfIntentForTrustOnboardingRequestParams,
  TrustOnboardingDocumentsApi,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionDocumentListItem,
  UploadTrustOnboardingSubmissionDocumentRequestParams
} from '../../../../../api/generated';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {FullLangPipe} from '../../../../../shared/full-lang/full-lang.pipe';
import {UploadComponent, UploadedFile, UploadItem} from '../../../../../shared/upload/upload.component';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {AbstractOnboardingStepComponent} from '../abstract-onboarding-step-component';
import CorrespondingLanguageEnum = TrustOnboardingSubmission.CorrespondingLanguageEnum;
import DocumentTypeEnum = TrustOnboardingSubmissionDocumentListItem.TypeEnum;

type UploadedDocument = Pick<TrustOnboardingSubmissionDocumentListItem, 'id' | 'name' | 'canBeDeleted'>;

interface BackendUploadError {
  errorCode?: string;
  message?: string;
  traceId?: string;
  additionalDetails?: string[];
}

interface InternalUploadItem extends UploadItem {
  error?: BackendUploadError;
}

@Component({
  selector: 'app-onboarding-step-documents',
  standalone: true,
  imports: [
    MatIcon,
    ObButtonDirective,
    ReactiveFormsModule,
    TranslatePipe,
    MatButton,
    MatAnchor,
    ObUnsavedChangesDirective,
    FullLangPipe,
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    ObMatErrorDirective,
    UploadComponent
  ],
  templateUrl: './onboarding-step-documents.component.html',
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: OnboardingStepDocumentsComponent}],
  styleUrls: ['../onboarding-steps.scss', './onboarding-step-documents.component.scss']
})
export class OnboardingStepDocumentsComponent extends AbstractOnboardingStepComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly documentsApi = inject(TrustOnboardingDocumentsApi);
  private readonly httpClient = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly appConfigService = inject(AppConfigService);
  protected readonly wizardService = inject(TrustOnboardingWizardService);
  readonly languages: string[] = Object.values(CorrespondingLanguageEnum);
  readonly translateService = inject(TranslateService);
  protected uploadItem?: InternalUploadItem;
  protected otherUploadItem?: InternalUploadItem;

  readonly form = this.fb.group({
    uploadedFiles: this.fb.control<UploadedDocument[]>([], [Validators.required, Validators.minLength(1)]),
    otherDocuments: this.fb.control<UploadedDocument[]>([]),
    doiLanguage: this.fb.control<CorrespondingLanguageEnum>(CorrespondingLanguageEnum.De, [Validators.required])
  });

  // Additional documents are only required for BUSINESS partners that are not registered in the
  // commercial register (i.e. have no UID) and for GOVERNMENTAL_INSTITUTION partners. All other
  // partner types must not see the section.
  readonly showAdditionalDocuments = computed(
    () =>
      (this.wizardService.requestedBusinessPartnerType() === BusinessPartner.TypeEnum.Business &&
        this.wizardService.submission()?.isRegisteredInCommercialRegister === false) ||
      this.wizardService.requestedBusinessPartnerType() === BusinessPartner.TypeEnum.GovernmentalInstitution
  );

  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    super();
    // Toggle validators on the additional-documents control so it only affects form validity when shown.
    effect(() => {
      const otherDocuments = this.form.controls.otherDocuments;
      if (this.showAdditionalDocuments()) {
        otherDocuments.enable({emitEvent: false});
        otherDocuments.setValidators([Validators.required, Validators.minLength(1)]);
      } else {
        otherDocuments.disable({emitEvent: false});
        otherDocuments.clearValidators();
      }
      otherDocuments.updateValueAndValidity({emitEvent: false});
    });
  }

  ngOnInit() {
    this.loadTrigger$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => {
          const submissionId = this.wizardService.submissionId;
          if (!submissionId) {
            return EMPTY;
          }
          return this.documentsApi.listAllDocumentsForTrustOnboarding({
            id: submissionId,
            size: 50, // declaration of intent + potentially several additional ("other") documents
            page: 0,
            sort: ['createdAt,desc']
          });
        })
      )
      .subscribe(documents => {
        if (documents.content) {
          const valid = documents.content.filter(doc => doc.id && doc.name);
          const toUploadedDocument = (doc: TrustOnboardingSubmissionDocumentListItem): UploadedDocument => ({
            id: doc.id,
            name: doc.name,
            canBeDeleted: doc.canBeDeleted
          });
          this.form.patchValue({
            uploadedFiles: valid
              .filter(doc => doc.type === DocumentTypeEnum.TrustOnboardingDeclarationOfIntent)
              .map(toUploadedDocument),
            otherDocuments: valid
              .filter(doc => doc.type === DocumentTypeEnum.TrustOnboardingOther)
              .map(toUploadedDocument)
          });
          this.form.updateValueAndValidity();
        }
      });
    const currentLang = this.translateService.getCurrentLang();
    if (currentLang) {
      this.form.controls.doiLanguage.patchValue(currentLang.toUpperCase() as CorrespondingLanguageEnum);
    }

    (this.wizardService.submissionUpdated$ ?? EMPTY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshDocumentsAfterSubmissionUpdate());

    this.loadTrigger$.next();
    this.translateSetup();
  }

  private refreshDocumentsAfterSubmissionUpdate(): void {
    this.loadTrigger$.next();

    // The backend can remove or re-create documents shortly after submission updates.
    timer(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTrigger$.next());
  }

  override async validate(): Promise<boolean> {
    const isValid = this.form.valid;

    if (!isValid) {
      this.form.markAllAsTouched();
    }

    return isValid;
  }

  override isValid(): boolean {
    return this.form.valid;
  }

  downloadDoi() {
    const submissionId = this.wizardService.submissionId;
    if (!submissionId) {
      return;
    }

    this.documentsApi
      .getDeclarationOfIntentForTrustOnboarding(
        {
          language: this.form.controls.doiLanguage.value,
          id: submissionId
        } as GetDeclarationOfIntentForTrustOnboardingRequestParams,
        'response'
      )
      .subscribe(response => this.downloadDeclarationOfIntentResponse(response, submissionId));
  }

  private downloadDeclarationOfIntentResponse(response: HttpResponse<Blob>, submissionId: string): void {
    const body = response.body;
    if (!body) {
      return;
    }

    const contentDisposition = response.headers.get('content-disposition') ?? '';
    const filename =
      this.extractFilenameFromContentDisposition(contentDisposition) ?? `declaration-of-intent-${submissionId}.pdf`;

    this.downloadBlobAsFile(body, filename);
  }

  // Triggers a native browser file download from an authenticated API blob response.
  private downloadBlobAsFile(blob: Blob, filename: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  private extractFilenameFromContentDisposition(contentDisposition: string): string | null {
    // Supports RFC 5987 format: filename*=UTF-8''encoded-filename
    const encodedFilenameMatch = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
    if (encodedFilenameMatch?.[1]) {
      return decodeURIComponent(encodedFilenameMatch[1]);
    }

    const filenameMatch = /filename\s*=\s*"?([^";]+)"?/i.exec(contentDisposition);
    return filenameMatch?.[1] ?? null;
  }

  onFileChosen(file: File): void {
    this.startUpload(file);
  }

  retryUpload(): void {
    if (this.uploadItem?.file) {
      this.startUpload(this.uploadItem.file);
    }
  }

  removeUpload(): void {
    this.uploadItem = undefined;

    const control = this.form.controls.uploadedFiles;
    control.patchValue([]);
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  private startUpload(file: File): void {
    this.uploadItem = {
      file,
      state: 'uploading'
    } satisfies InternalUploadItem;

    this.form.controls.uploadedFiles.markAsTouched();
    this.form.controls.uploadedFiles.setErrors(null);

    this.documentsApi
      .uploadTrustOnboardingSubmissionDocument({
        file: file,
        id: this.wizardService.submissionId
      } as UploadTrustOnboardingSubmissionDocumentRequestParams)
      .subscribe({
        next: () => {
          this.uploadItem = undefined;
          this.form.controls.uploadedFiles.setErrors(null);
          this.loadTrigger$.next();
        },
        error: (err: HttpErrorResponse) => {
          this.uploadItem = {
            file,
            state: 'error'
          };

          this.form.controls.uploadedFiles.setErrors({
            ...this.mapBackendDetailsToControlErrors(err)
          });
        }
      });
  }

  private mapBackendDetailsToControlErrors(error: HttpErrorResponse): Record<string, string> {
    const details = error.error?.additionalDetails;

    if (!Array.isArray(details)) {
      return {};
    }

    return details.reduce<Record<string, string>>((acc, detail) => {
      if (typeof detail === 'string' && detail.trim()) {
        acc[detail] = `eportal_onboardingTR_formalProof_declaration_of_intent_error_${detail}`;
      }
      return acc;
    }, {});
  }

  onOtherFileChosen(file: File): void {
    this.startOtherUpload(file);
  }

  retryOtherUpload(): void {
    if (this.otherUploadItem?.file) {
      this.startOtherUpload(this.otherUploadItem.file);
    }
  }

  removeOtherUpload(): void {
    this.otherUploadItem = undefined;
  }

  private startOtherUpload(file: File): void {
    const submissionId = this.wizardService.submissionId;
    if (!submissionId) {
      return;
    }

    this.otherUploadItem = {
      file,
      state: 'uploading'
    } satisfies InternalUploadItem;
    this.form.controls.otherDocuments.markAsTouched();

    const formData = new FormData();
    formData.append('file', file);

    // The generated API client has no method for the "other documents" endpoint, so we post directly.
    // Auth headers are added by the global ObHttpApiInterceptor, as for every other API call.
    this.httpClient
      .post(`/api/v1/trust-onboarding-submission/${submissionId}/documents/other`, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.otherUploadItem = undefined;
          this.loadTrigger$.next();
        },
        error: () => {
          this.otherUploadItem = {
            file,
            state: 'error'
          };
        }
      });
  }

  deleteDocument(doc: UploadedFile): void {
    const submissionId = this.wizardService.submissionId;
    if (!submissionId || !doc.id) {
      return;
    }
    this.documentsApi.deleteTrustOnboardingSubmissionDocument({id: submissionId, documentId: doc.id}).subscribe({
      next: () => {
        const uploadedFiles = this.form.controls.uploadedFiles.value ?? [];
        const otherDocuments = this.form.controls.otherDocuments.value ?? [];
        this.form.patchValue({
          uploadedFiles: uploadedFiles.filter(f => f.id !== doc.id),
          otherDocuments: otherDocuments.filter(f => f.id !== doc.id)
        });
        this.form.updateValueAndValidity();
      },
      error: () => this.loadTrigger$.next()
    });
  }

  private translateSetup() {
    this.translateService.get('eportal_onboardingTR_formalProof_declaration_of_intent_error_no_signatures_found');
    this.translateService.get(
      'eportal_onboardingTR_formalProof_declaration_of_intent_error_invalid_signatures_for_mandant'
    );
    this.translateService.get(
      'eportal_onboardingTR_formalProof_declaration_of_intent_error_validation_service_not_available'
    );
    this.translateService.get(
      'eportal_onboardingTR_formalProof_declaration_of_intent_error_violating_doi_variant_single_signature'
    );
    this.translateService.get(
      'eportal_onboardingTR_formalProof_declaration_of_intent_error_violating_doi_variant_joint_signature_two'
    );
    this.translateService.get(
      'eportal_onboardingTR_formalProof_declaration_of_intent_error_violating_doi_variant_joint_signature_three'
    );
  }

  protected readonly Object = Object;
}
