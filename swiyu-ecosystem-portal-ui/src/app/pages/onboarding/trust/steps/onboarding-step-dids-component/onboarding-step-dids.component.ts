import {Component, effect, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonDirective, ObUnsavedChangesDirective} from '@oblique/oblique';
import {IdentifierApi, IdentifierResponse, PagedModelIdentifierResponse} from '../../../../../api/generated';
import {AppRoutes} from '../../../../../app.routes';
import {IdentifierBaseOnboardingStatusComponent} from '../../../../../shared/identifier-base-onboarding-status/identifier-base-onboarding-status.component';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {AbstractOnboardingStepComponent} from '../abstract-onboarding-step-component';

@Component({
  selector: 'app-onboarding-step-dids',
  imports: [
    ReactiveFormsModule,
    MatTable,
    MatCellDef,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderRow,
    MatRow,
    MatTooltip,
    ObButtonDirective,
    TranslateModule,
    MatCheckbox,
    MatIcon,
    MatButtonModule,
    ObUnsavedChangesDirective,
    IdentifierBaseOnboardingStatusComponent,
    RouterLink
  ],
  templateUrl: 'onboarding-step-dids.component.html',
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: OnboardingStepDidsComponent}],
  styleUrls: ['../onboarding-steps.scss']
})
export class OnboardingStepDidsComponent extends AbstractOnboardingStepComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly identifierApi = inject(IdentifierApi);
  protected readonly wizardService = inject(TrustOnboardingWizardService);

  availableDids: IdentifierResponse[] = [];
  readonly title = 'DIDs';
  readonly id = 'dids';

  displayedColumns: string[] = ['checked', 'did', 'description', 'status', 'actions'];

  readonly form = this.fb.group({
    dids: this.fb.control<string[]>([], [Validators.required, Validators.minLength(1)])
  });

  constructor() {
    super();
    this.form.valueChanges.subscribe(value => {
      this.wizardService.updateDidSelection(value?.dids ?? []);
    });

    effect(() => {
      const dids = this.wizardService.submission()?.proofOfPossessionList.map(pop => pop.did ?? '');
      if (dids) {
        this.form.controls.dids.setValue(dids);
      }
    });
  }

  ngOnInit(): void {
    this.identifierApi
      .getAllIdentifiersOfPartner({
        partnerId: this.wizardService.partnerId!,
        size: 100,
        page: 0,
        sort: ['createdAt,desc']
      })
      .subscribe({
        next: (result: PagedModelIdentifierResponse) => {
          if (result.content) {
            this.availableDids = result.content.filter(value => {
              return value.did !== undefined;
            });
          }
        }
      });
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

  toggleDid(event: MatCheckboxChange): void {
    const checkbox = event.source;
    const did = checkbox.value;
    const currentDids = this.form.controls.dids.value || [];
    if (checkbox.checked) {
      const newDids = [...currentDids, did];
      this.form.controls.dids.setValue(newDids);
    } else {
      this.form.controls.dids.setValue(currentDids.filter(d => d !== did));
    }
  }

  protected readonly AppRoutes = AppRoutes;
}
