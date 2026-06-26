import {CommonModule, DatePipe} from '@angular/common';
import {Component, effect, inject, input, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObButtonModule, ObSpinnerComponent} from '@oblique/oblique';
import {finalize} from 'rxjs';
import {BusinessPartner, BusinessPartnerApi} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {DetailSectionComponent} from '../../shared/detail-section/detail-section.component';
import {FormField} from '../../shared/detail-section/form-field.model';
import {LocalizeService} from '../../shared/i18n/localize.service';

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
export class BusinessPartnerProfileComponent implements OnInit {
  businessPartnerId = input.required<string>();
  partner = signal<BusinessPartner | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  editingSections = signal<Set<string>>(new Set());
  // Field Definitions
  detailsFields: FormField[] = [
    {key: 'name', label: 'eportal_swiyuProfile_label_nameOfOrganisation', type: 'text'},
    {key: 'createdAt', label: 'eportal_swiyuProfile_label_registeredSince', type: 'date'},
    {key: 'uid', label: 'eportal_swiyuProfile_label_uid', type: 'readonly'},
    {key: 'id', label: 'eportal_onboarding_development_businesspartnerID_label', type: 'readonly', canCopy: true}
  ];
  addressFields: FormField[] = [
    {key: 'street', label: 'eportal_swiyuProfile_label_streetAndNumber'},
    {key: 'postalCode', label: 'eportal_swiyuProfile_label_postalCode'},
    {key: 'city', label: 'eportal_swiyuProfile_label_city'},
    {key: 'region', label: 'eportal_swiyuProfile_label_region'},
    {key: 'country', label: 'eportal_swiyuProfile_label_country'}
  ];
  contactFields: FormField[] = [
    {key: 'contactPhone', label: 'eportal_swiyuProfile_label_phone'},
    {key: 'contactEmailAddress', label: 'eportal_swiyuProfile_label_email'}
  ];
  protected readonly AppRoutes = AppRoutes;
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly fb = inject(FormBuilder);
  // Forms
  detailsForm: FormGroup = this.fb.group({});
  addressForm: FormGroup = this.fb.group({});
  contactForm: FormGroup = this.fb.group({});
  generalForm: FormGroup = this.fb.group({});
  private readonly translateService = inject(TranslateService);
  private readonly localizer = inject(LocalizeService);

  constructor() {
    this.translateSetup();
    effect(() => {
      const entityName = this.localizer.localize(() => this.partner()?.entityName);
      this.detailsForm.patchValue({
        name: entityName()
      });
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

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.detailsForm = this.fb.group({
      name: ['', Validators.required],
      createdAt: [{value: '', disabled: true}],
      uid: [{value: '', disabled: true}],
      id: [{value: '', disabled: true}]
    });

    this.addressForm = this.fb.group({
      street: [''],
      postalCode: [''],
      city: [''],
      region: [''],
      country: ['']
    });

    this.contactForm = this.fb.group({
      contactPhone: [''],
      contactEmailAddress: ['', [Validators.email]]
    });

    this.generalForm = this.fb.group({
      email: ['', [Validators.email]]
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
    this.detailsForm.patchValue({
      createdAt: data.createdAt,
      uid: data.uid,
      id: data.id
    });

    if (data.address) {
      this.addressForm.patchValue({
        street: data.address.street,
        postalCode: data.address.postalCode,
        city: data.address.city,
        region: data.address.region,
        country: data.address.country
      });
    }

    this.contactForm.patchValue({
      contactPhone: data.contactPhone,
      contactEmailAddress: data.contactEmailAddress
    });

    this.generalForm.patchValue({
      email: data.contactEmailAddress
    });
  }

  onEdit(section: string) {
    this.editingSections.update(sections => {
      const newSections = new Set(sections);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return newSections;
    });
  }

  isEditing(section: string): boolean {
    return this.editingSections().has(section);
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_swiyuProfile_label_nameOfOrganisation');
    this.translateService.get('eportal_swiyuProfile_label_registeredSince');
    this.translateService.get('eportal_swiyuProfile_label_uid');
    this.translateService.get('eportal_onboarding_development_businesspartnerID_label');
    this.translateService.get('eportal_swiyuProfile_label_streetAndNumber');
    this.translateService.get('eportal_swiyuProfile_label_postalCode');
    this.translateService.get('eportal_swiyuProfile_label_city');
    this.translateService.get('eportal_swiyuProfile_label_region');
    this.translateService.get('eportal_swiyuProfile_label_country');
    this.translateService.get('eportal_swiyuProfile_label_phone');
    this.translateService.get('eportal_swiyuProfile_label_email');
    this.translateService.get('eportal_swiyuProfile_section_details');
    this.translateService.get('eportal_swiyuProfile_section_address');
    this.translateService.get('eportal_swiyuProfile_section_contact');
  }
}
