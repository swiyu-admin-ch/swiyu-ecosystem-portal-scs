import {Component, inject, input} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
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

/**
 * Explainer screen that guides users through the process of adding additional DIDs
 * via Proof of Possession. Displays step-by-step instructions and provides the
 * Trust API URL needed to submit the proof.
 */
@Component({
  selector: 'app-additional-dids-explainer',
  standalone: true,
  imports: [
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
  templateUrl: './additional-dids-explainer.component.html',
  styleUrls: ['./additional-dids-explainer.component.scss']
})
export class AdditionalDidsExplainerComponent {
  businessPartnerId = input.required<string>();
  requiredInfoFields: FormField[] = [
    {
      key: 'apiUrlPoP',
      label: 'eportal_verifyAdditionalDIDs_label_apiUrlPoP',
      type: 'readonly',
      canCopy: true
    }
  ];
  protected readonly AppRoutes = AppRoutes;
  private readonly translateService = inject(TranslateService);
  private readonly appConfig = inject(AppConfigService);
  requiredInfoForm: FormGroup = inject(FormBuilder).group({
    apiUrlPoP: [this.appConfig.trustApiUrl]
  });

  constructor() {
    this.translateSetup();
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_verifyAdditionalDIDs_label_apiUrlPoP');
    this.translateService.get('eportal_global_link_DIDtoolbox_url');
  }
}
