import {CommonModule} from '@angular/common';
import {Component, inject, input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';

import {RouterLink} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObAlertComponent, ObButtonDirective} from '@oblique/oblique';
import {AppRoutes} from '../../../app.routes';
import {AppConfigService} from '../../../core/appconfig/app-config.service';
import {DetailSectionComponent} from '../../../shared/detail-section/detail-section.component';
import {FormField} from '../../../shared/detail-section/form-field.model';
import {ProcessStepComponent} from '../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../shared/process/process.component';

@Component({
  selector: 'app-did-setup',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    MatDrawerContainer,
    MatDrawerContent,
    ObButtonDirective,
    RouterLink,
    DetailSectionComponent,
    ObAlertComponent,
    ProcessComponent,
    ProcessStepComponent
  ],
  templateUrl: './did-setup.component.html',
  styleUrls: ['./did-setup.component.scss']
})
export class DidSetupComponent implements OnInit {
  businessPartnerId = input.required<string>();
  requiredInfoFields: FormField[] = [
    {
      key: 'apiUrlBaseRegistry',
      label: 'eportal_DIDdetails_label_apiURLbaseRegistry',
      type: 'readonly',
      canCopy: true
    },
    {
      key: 'businessPartnerId',
      label: 'eportal_onboarding_development_businesspartnerID_label',
      type: 'readonly',
      canCopy: true
    }
  ];
  availableDidSpacesFields: FormField[] = [
    {key: 'didSpacesCommand', label: 'eportal_DIDdetails_label_uuid', type: 'text', canCopy: true}
  ];
  protected readonly AppRoutes = AppRoutes;
  private readonly fb = inject(FormBuilder);
  requiredInfoForm: FormGroup = this.fb.group({});
  availableDidSpacesForm: FormGroup = this.fb.group({});
  private readonly translateService = inject(TranslateService);
  protected readonly appConfig = inject(AppConfigService);

  constructor() {
    this.translateSetup();
  }

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.requiredInfoForm = this.fb.group({
      apiUrlBaseRegistry: [this.appConfig.identifierRegistryApiUrl],
      businessPartnerId: [this.businessPartnerId()]
    });
    this.availableDidSpacesForm = this.fb.group({
      didSpacesCommand: `curl -X GET -H "Authorization: Bearer $TOKEN" ${this.appConfig.identifierRegistryApiUrl}api/v1/identifier/business-entities/${this.businessPartnerId()}/identifier/`
    });
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_DIDdetails_label_apiURLbaseRegistry');
    this.translateService.get('eportal_onboarding_development_businesspartnerID_label');
    this.translateService.get('eportal_DIDdetails_label_uuid');
  }
}
