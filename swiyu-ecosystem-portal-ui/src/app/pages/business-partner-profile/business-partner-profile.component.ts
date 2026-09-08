import {CommonModule, DatePipe} from '@angular/common';
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObButtonModule, ObNotificationService, ObSpinnerComponent} from '@oblique/oblique';
import {finalize} from 'rxjs';
import {BusinessPartner, BusinessPartnerApi, BusinessPartnerIdentityStatus, Language} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {DetailSectionComponent} from '../../shared/detail-section/detail-section.component';
import {FormField} from '../../shared/detail-section/form-field.model';
import {LocalizeService} from '../../shared/i18n/localize.service';
import {SWISS_LANGUAGES} from '../../shared/i18n/swiss-languages.util';
import {CustomValidators} from '../../shared/validators/custom-validators';

@Component({
  selector: 'app-business-partner-profile',
  templateUrl: './business-partner-profile.component.html',
  styleUrl: './business-partner-profile.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    ObButtonModule,
    ObSpinnerComponent,
    RouterModule,
    DetailSectionComponent,
    MatSidenavModule
  ],
  providers: [DatePipe]
})
export class BusinessPartnerProfileComponent {
  businessPartnerId = input.required<string>();
  partner = signal<BusinessPartner | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  editingSections = signal<Set<string>>(new Set());

  /** True when the partner's business identity is ACTIVE (trusted) — name/uid become read-only */
  readonly isIdentityActive = computed(
    () => this.partner()?.businessPartnerIdentity?.status === BusinessPartnerIdentityStatus.Active
  );

  /** Profile details fields — name and uid are editable only when identity is NOT ACTIVE */
  readonly profileDetailsFields = computed<FormField[]>(() => [
    {
      key: 'name',
      label: 'eportal_swiyuProfile_label_nameOfOrganisation',
      type: this.isIdentityActive() ? 'readonly' : 'text',
      validators: [Validators.required, CustomValidators.notBlank()],
      errors: {
        required: 'eportal_onboarding_profile_error_inputLabel_name',
        blank: 'eportal_onboarding_profile_error_inputLabel_name'
      }
    },
    {key: 'createdAt', label: 'eportal_swiyuProfile_label_registeredSince', type: 'datetime', hideInActiveEdit: true},
    {key: 'lastActivated', label: 'eportal_swiyuProfile_label_lastActivated', type: 'datetime', hideInActiveEdit: true},
    {
      key: 'uid',
      label: 'eportal_swiyuProfile_label_uid',
      type: this.isIdentityActive() ? 'readonly' : 'text',
      validators: [CustomValidators.swissUid()],
      errors: {
        swissUid: 'eportal_onboarding_profile_inputLabel_uid_error_uidFormat'
      }
    },
    {key: 'id', label: 'eportal_onboarding_development_businesspartnerID_label', type: 'readonly', canCopy: true},
    {key: 'type', label: 'eportal_swiyuProfile_label_type', type: 'readonly'}
  ]);

  readonly addressFields: FormField[] = [
    {
      key: 'street',
      label: 'eportal_swiyuProfile_label_streetAndNumber',
      validators: [CustomValidators.emptyOrNotBlank()],
      errors: {
        blank: 'eportal_onboarding_profile_error_inputLabel_street'
      }
    },
    {
      key: 'postalCode',
      label: 'eportal_swiyuProfile_label_postalCode',
      validators: [Validators.required, CustomValidators.swissZipCode()],
      errors: {
        required: 'eportal_onboarding_profile_inputLabel_postalCode_error',
        swissZipCode: 'eportal_onboarding_profile_inputLabel_postalCode_error_zipFormat'
      }
    },
    {
      key: 'city',
      label: 'eportal_swiyuProfile_label_city',
      validators: [Validators.required, CustomValidators.notBlank()],
      errors: {
        required: 'eportal_onboarding_profile_error_inputLabel_city',
        blank: 'eportal_onboarding_profile_error_inputLabel_city'
      }
    },
    {key: 'country', label: 'eportal_swiyuProfile_label_country', type: 'readonly'}
  ];

  readonly contactFields: FormField[] = [
    {
      key: 'firstName',
      label: 'eportal_swiyuProfile_label_firstName',
      validators: [Validators.required, CustomValidators.notBlank()],
      errors: {
        required: 'eportal_global_inputLabel_error_name',
        blank: 'eportal_global_inputLabel_error_name'
      }
    },
    {
      key: 'lastName',
      label: 'eportal_swiyuProfile_label_lastName',
      validators: [Validators.required, CustomValidators.notBlank()],
      errors: {
        required: 'eportal_global_inputLabel_error_surname',
        blank: 'eportal_global_inputLabel_error_surname'
      }
    },
    {
      key: 'phone',
      label: 'eportal_swiyuProfile_label_phone',
      validators: [Validators.required, CustomValidators.internationalPhoneNumber()],
      errors: {
        required: 'eportal_global_inputLabel_error_phone',
        internationalPhoneNumber: 'eportal_global_inputLabel_error_phone_format_international',
        swissPhoneNumber: 'eportal_global_inputLabel_error_phone_format'
      }
    },
    {
      key: 'email',
      label: 'eportal_swiyuProfile_label_email',
      validators: [Validators.required, Validators.email],
      errors: {
        required: 'eportal_global_inputLabel_error_email',
        email: 'eportal_global_inputLabel_error_emailFormat'
      }
    },
    {
      key: 'correspondingLanguage',
      label: 'eportal_swiyuProfile_label_correspondingLanguage',
      selectOptions: SWISS_LANGUAGES.map(lang => ({
        value: lang,
        labelKey: `eportal_global_lang_${lang.toLowerCase()}`
      }))
    }
  ];

  protected readonly AppRoutes = AppRoutes;
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly fb = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  private readonly localizer = inject(LocalizeService);
  private readonly notificationService = inject(ObNotificationService);

  // Snapshots for cancel/discard — keyed by section name
  private readonly snapshots: Record<string, Record<string, unknown>> = {};

  // Forms — initialised eagerly so effects can patch them immediately
  profileDetailsForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, CustomValidators.notBlank()]],
    createdAt: [{value: '', disabled: true}],
    lastActivated: [{value: '', disabled: true}],
    uid: ['', [CustomValidators.swissUid()]],
    id: [{value: '', disabled: true}],
    type: [{value: '', disabled: true}]
  });

  addressForm: FormGroup = this.fb.group({
    street: ['', [CustomValidators.emptyOrNotBlank()]],
    postalCode: ['', [Validators.required, CustomValidators.swissZipCode()]],
    city: ['', [Validators.required, CustomValidators.notBlank()]],
    country: [{value: '', disabled: true}]
  });

  contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, CustomValidators.notBlank()]],
    lastName: ['', [Validators.required, CustomValidators.notBlank()]],
    phone: ['', [Validators.required, CustomValidators.internationalPhoneNumber()]],
    email: ['', [Validators.required, Validators.email]],
    correspondingLanguage: ['']
  });

  constructor() {
    this.translateSetup();
    effect(() => {
      const entityName = this.localizer.localize(() => this.partner()?.entityName);
      this.profileDetailsForm.patchValue({name: entityName()});
    });
    effect(() => {
      const id = this.businessPartnerId();
      if (id) {
        this.loadPartner(id);
      } else {
        this.error.set('No partner ID provided');
      }
    });
  }

  loadPartner(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.businessPartnerApi
      .getBusinessPartner({businessPartnerId: id})
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data: BusinessPartner) => {
          this.partner.set(data);
          this.patchForms(data);
        },
        error: err => this.error.set(err.message || 'Failed to load partner details')
      });
  }

  patchForms(data: BusinessPartner) {
    this.profileDetailsForm.patchValue({
      createdAt: data.createdAt,
      lastActivated: data.businessPartnerIdentity?.lastActivated,
      uid: data.uid,
      id: data.id,
      type: this.mapBusinessPartnerTypeToLabel(data.type)
    });

    const address = data.address;
    if (address) {
      this.addressForm.patchValue({
        street: address.street,
        postalCode: address.postalCode,
        city: address.city,
        country: address.country
      });
    }

    const contact = data.contact;
    if (contact) {
      this.contactForm.patchValue({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        correspondingLanguage: contact.correspondingLanguage
      });
    }
  }

  private mapBusinessPartnerTypeToLabel(type: BusinessPartner.TypeEnum) {
    switch (type) {
      case BusinessPartner.TypeEnum.Business:
        return 'eportal_onboarding_profile_card_business';
      case BusinessPartner.TypeEnum.GovernmentalInstitution:
        return 'eportal_onboarding_profile_card_government';
      case BusinessPartner.TypeEnum.Individual:
        return 'eportal_onboarding_profile_card_individual';
    }
    return '-';
  }

  private formForSection(section: string): FormGroup {
    return (
      {profileDetails: this.profileDetailsForm, address: this.addressForm, contact: this.contactForm} as Record<
        string,
        FormGroup
      >
    )[section];
  }

  onEdit(section: string) {
    const form = this.formForSection(section);
    // Snapshot current raw values so cancel can restore them
    this.snapshots[section] = form.getRawValue();

    // When identity is ACTIVE, name and uid must stay read-only
    if (section === 'profileDetails') {
      if (this.isIdentityActive()) {
        this.profileDetailsForm.controls['name'].disable();
        this.profileDetailsForm.controls['uid'].disable();
      } else {
        this.profileDetailsForm.controls['name'].enable();
        this.profileDetailsForm.controls['uid'].enable();
      }
    }

    this.editingSections.update(s => new Set([...s, section]));
  }

  onSave(section: string) {
    const form = this.formForSection(section);
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }

    const partnerId = this.businessPartnerId();
    const raw = form.getRawValue();

    // Build the update payload — only include sections relevant to this tile
    const payload = this.buildPayload(section, raw);

    this.businessPartnerApi
      .updateBusinessPartner({
        businessPartnerId: partnerId,
        businessPartnerUpdateRequest: payload
      })
      .subscribe({
        next: (updated: BusinessPartner) => {
          this.partner.set(updated);
          this.patchForms(updated);
          this.exitEdit(section);
          this.notificationService.success('eportal_swiyuProfile_notification_saveSuccess');
        },
        error: () => {
          this.notificationService.error('eportal_swiyuProfile_notification_saveError');
        }
      });
  }

  onCancel(section: string) {
    const form = this.formForSection(section);
    const snapshot = this.snapshots[section];
    if (snapshot) {
      form.reset(snapshot);
    }
    this.exitEdit(section);
  }

  /** Stub for EID-6621: profile-change flow for ACTIVE partners */
  onStartUpdate() {
    // The full re-verification flow will be implemented in EID-6621
  }

  isEditing(section: string): boolean {
    return this.editingSections().has(section);
  }

  private exitEdit(section: string) {
    this.editingSections.update(s => {
      const next = new Set(s);
      next.delete(section);
      return next;
    });
    // Re-disable name/uid after leaving edit mode
    if (section === 'profileDetails') {
      this.profileDetailsForm.controls['name'].enable();
      this.profileDetailsForm.controls['uid'].enable();
    }
  }

  private buildPayload(section: string, raw: Record<string, unknown>) {
    // Partial update — only the edited tile is submitted. The CBS applies only the
    // non-null fields and preserves the rest, so the other tiles are never overwritten.

    if (section === 'address') {
      return {
        address: {
          street: (raw['street'] as string) || undefined,
          postalCode: raw['postalCode'] as string,
          city: raw['city'] as string,
          country: raw['country'] as string
        }
      };
    }

    if (section === 'contact') {
      return {
        contact: {
          firstName: raw['firstName'] as string,
          lastName: raw['lastName'] as string,
          email: raw['email'] as string,
          phone: raw['phone'] as string,
          correspondingLanguage: (raw['correspondingLanguage'] as Language) || undefined
        }
      };
    }

    // profileDetails — name/uid are only editable while the identity is NOT ACTIVE.
    // name is always required and never sent blank (the CBS guard skips blank names).
    return {
      name: this.isIdentityActive() ? undefined : (raw['name'] as string) || undefined,
      uid: this.isIdentityActive() ? undefined : (raw['uid'] as string) || undefined
    };
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_swiyuProfile_label_nameOfOrganisation');
    this.translateService.get('eportal_swiyuProfile_label_registeredSince');
    this.translateService.get('eportal_swiyuProfile_label_lastActivated');
    this.translateService.get('eportal_swiyuProfile_label_uid');
    this.translateService.get('eportal_onboarding_development_businesspartnerID_label');
    this.translateService.get('eportal_swiyuProfile_label_type');
    this.translateService.get('eportal_swiyuProfile_label_streetAndNumber');
    this.translateService.get('eportal_swiyuProfile_label_postalCode');
    this.translateService.get('eportal_swiyuProfile_label_city');
    this.translateService.get('eportal_swiyuProfile_label_country');
    this.translateService.get('eportal_swiyuProfile_label_firstName');
    this.translateService.get('eportal_swiyuProfile_label_lastName');
    this.translateService.get('eportal_swiyuProfile_label_email');
    this.translateService.get('eportal_swiyuProfile_label_phone');
    this.translateService.get('eportal_swiyuProfile_label_correspondingLanguage');
    this.translateService.get('eportal_swiyuProfile_section_profileDetails');
    this.translateService.get('eportal_swiyuProfile_section_address');
    this.translateService.get('eportal_swiyuProfile_subTitle_contact');
    this.translateService.get('eportal_swiyuProfile_notification_saveSuccess');
    this.translateService.get('eportal_swiyuProfile_notification_saveError');
    this.translateService.get('eportal_swiyuProfile_profileChange_alert_body');
    this.translateService.get('eportal_swiyuProfile_profileChange_label_service');
    this.translateService.get('eportal_swiyuProfile_profileChange_label_total');
    this.translateService.get('eportal_swiyuProfile_profileChange_price');
    this.translateService.get('eportal_swiyuProfile_profileChange_btn_start');
    this.translateService.get('eportal_global_TR_productName');
  }
}
