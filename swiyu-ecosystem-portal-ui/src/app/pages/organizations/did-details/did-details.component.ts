import {CommonModule} from '@angular/common';
import {Component, computed, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormGroup, FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObButtonModule, ObNotificationService, ObSpinnerComponent} from '@oblique/oblique';
import {finalize, forkJoin} from 'rxjs';
import {BusinessPartner, BusinessPartnerApi, IdentifierApi, IdentifierResponse} from '../../../api/generated';
import {AppRoutes} from '../../../app.routes';
import {AppConfigService} from '../../../core/appconfig/app-config.service';
import {DetailSectionComponent} from '../../../shared/detail-section/detail-section.component';
import {FormField, SectionLink} from '../../../shared/detail-section/form-field.model';

interface DidDetailsData {
  identifier: IdentifierResponse;
  businessPartner: BusinessPartner;
}

@Component({
  selector: 'app-did-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    ObButtonModule,
    ObSpinnerComponent,
    TranslateModule,
    RouterModule,
    DetailSectionComponent
  ],
  templateUrl: './did-details.component.html',
  styleUrls: ['./did-details.component.scss']
})
export class DidDetailsComponent implements OnInit {
  // Route params
  businessPartnerId = input.required<string>();
  identifierEntryId = input.required<string>();
  // State
  readonly data = signal<DidDetailsData | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  // Description editing
  readonly description = signal('');
  readonly isEditingDescription = signal(false);
  readonly isDescriptionValid = computed(() => this.description().length <= 255);
  // Field Definitions
  didInformationFields: FormField[] = [
    {key: 'did', label: 'app_site_did-details_card_did-information_did', type: 'readonly', canCopy: true},
    {
      key: 'didSpace',
      label: 'app_site_did-details_card_did-information_did-space',
      type: 'readonly',
      canCopy: true
    },
    {
      key: 'identifierRegistryUrl',
      label: 'app_site_did-details_card_did-information_identifier-registry-url',
      type: 'readonly',
      canCopy: true
    },
    {
      key: 'identifierRegistryUrlDidLog',
      label: 'app_site_did-details_card_did-information_identifier-registry-url-didlog',
      type: 'readonly',
      canCopy: true
    }
  ];
  apiUrlsFields: FormField[] = [
    {
      key: 'baseRegistry',
      label: 'app_site_did-details_card_api-urls_base-registry',
      type: 'readonly',
      canCopy: true
    },
    {
      key: 'statusRegistry',
      label: 'app_site_did-details_card_api-urls_status-registry',
      type: 'readonly',
      canCopy: true
    },
    {key: 'authToken', label: 'app_site_did-details_card_api-urls_auth-token', type: 'readonly', canCopy: true}
  ];
  profileInfoFields: FormField[] = [
    {key: 'swiyuProfile', label: 'app_site_did-details_profile_swiyu-profile', type: 'readonly'},
    {
      key: 'businessPartnerId',
      label: 'app_site_did-details_profile_business-partner-id',
      type: 'readonly',
      canCopy: true
    }
  ];
  // Section Links
  didInformationLink: SectionLink = {
    label: 'app_site_did-details_card_did-information_docs-link',
    url: 'eportal_global_link_TechDocumentation_url_cookbook_didupdate'
  };
  apiUrlsLink: SectionLink = {
    label: 'app_site_did-details_card_api-urls_docs-link',
    url: 'eportal_global_link_TechDocumentation_url_cookbook_ssp'
  };
  protected readonly AppRoutes = AppRoutes;
  // Injected services
  private readonly fb = inject(FormBuilder);
  // Forms
  didInformationForm: FormGroup = this.fb.group({});
  apiUrlsForm: FormGroup = this.fb.group({});
  profileInfoForm: FormGroup = this.fb.group({});
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigService = inject(AppConfigService);
  private readonly notificationService = inject(ObNotificationService);
  private readonly identifierApi = inject(IdentifierApi);
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly translateService = inject(TranslateService);
  private readonly identifierRegistry = computed(() => {
    let ret = `/api/v1/did/${this.identifierEntryId()}`;
    if (this.appConfigService.identifierRegistryUrl) {
      const url = new URL(this.appConfigService.identifierRegistryUrl);
      url.pathname = ret;
      ret = url.toString();
    }
    return ret;
  });
  private originalDescription = '';

  constructor() {
    this.initForms();
  }

  ngOnInit(): void {
    this.translateSetup();
    this.loadData();
  }

  // Description editing
  editDescription(): void {
    this.originalDescription = this.description();
    this.isEditingDescription.set(true);
  }

  saveDescription(): void {
    if (!this.isDescriptionValid()) {
      return;
    }

    this.identifierApi
      .updateIdentifierDescription({
        partnerId: this.businessPartnerId(),
        identifierId: this.identifierEntryId(),
        identifierUpdateRequest: {description: this.description()}
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isEditingDescription.set(false);
          this.notificationService.success('app.site.did-details.notification.description-saved');
        },
        error: () => {
          this.description.set(this.originalDescription);
          this.isEditingDescription.set(false);
        }
      });
  }

  cancelEditDescription(): void {
    this.description.set(this.originalDescription);
    this.isEditingDescription.set(false);
  }

  private initForms(): void {
    this.didInformationForm = this.fb.group({
      did: [{value: '', disabled: true}],
      didSpace: [{value: '', disabled: true}],
      identifierRegistryUrl: [{value: '', disabled: true}],
      identifierRegistryUrlDidLog: [{value: '', disabled: true}]
    });

    this.apiUrlsForm = this.fb.group({
      baseRegistry: [{value: '', disabled: true}],
      statusRegistry: [{value: '', disabled: true}],
      authToken: [{value: '', disabled: true}]
    });

    this.profileInfoForm = this.fb.group({
      swiyuProfile: [{value: '', disabled: true}],
      businessPartnerId: [{value: '', disabled: true}]
    });
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      identifier: this.identifierApi.getIdentifierOfPartner({
        partnerId: this.businessPartnerId(),
        identifierId: this.identifierEntryId()
      }),
      businessPartner: this.businessPartnerApi.getBusinessPartner({
        businessPartnerId: this.businessPartnerId()
      })
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (result: DidDetailsData) => {
          this.data.set(result);
          this.description.set(result.identifier.description ?? '');
          this.patchForms(result);
        },
        error: err => {
          this.error.set(err.message || 'Failed to load DID details');
        }
      });
  }

  private patchForms(data: DidDetailsData): void {
    this.didInformationForm.patchValue({
      did: data.identifier.did,
      didSpace: data.identifier.id,
      identifierRegistryUrl: this.identifierRegistry(),
      identifierRegistryUrlDidLog: `${this.identifierRegistry()}/did.jsonl`
    });

    this.apiUrlsForm.patchValue({
      baseRegistry: this.appConfigService.identifierRegistryApiUrl ?? '',
      statusRegistry: this.appConfigService.statusRegistryApiUrl ?? '',
      authToken: this.appConfigService.apiGatewayAuthUrl ?? ''
    });

    this.profileInfoForm.patchValue({
      swiyuProfile: data.businessPartner?.name ?? '',
      businessPartnerId: this.businessPartnerId()
    });
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('app_site_did-details_card_api-urls_auth-token');
    this.translateService.get('app_site_did-details_card_api-urls_base-registry');
    this.translateService.get('app_site_did-details_card_api-urls_docs-link');
    this.translateService.get('app_site_did-details_card_api-urls_status-registry');
    this.translateService.get('app_site_did-details_card_did-information_did');
    this.translateService.get('app_site_did-details_card_did-information_did-space');
    this.translateService.get('app_site_did-details_card_did-information_docs-link');
    this.translateService.get('app_site_did-details_card_did-information_docs-link_api-keys-doc-url');
    this.translateService.get('app_site_did-details_card_did-information_docs-link_base-registry-doc-url');
    this.translateService.get('app_site_did-details_card_did-information_identifier-registry-url');
    this.translateService.get('app_site_did-details_profile_business-partner-id');
    this.translateService.get('app_site_did-details_profile_swiyu-profile');
    this.translateService.get('eportal_global_link_TechDocumentation_url_cookbook_didupdate');
    this.translateService.get('app_site_did-details_card_did-information_identifier-registry-url-didlog');
  }
}
