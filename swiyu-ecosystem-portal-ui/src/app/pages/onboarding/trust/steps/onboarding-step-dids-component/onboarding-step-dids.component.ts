import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
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
import {applyFieldState} from '../../wizard/trust-onboarding-field-state.util';
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

  availableDids = signal<IdentifierResponse[]>([]);
  displayedColumns: string[] = ['checked', 'did', 'description', 'status', 'actions'];

  readonly form = this.fb.group({
    didCheckboxes: this.fb.array<FormControl<boolean>>([], this.requireAtLeastOneSelected)
  });

  constructor() {
    super();
    this.form.controls.didCheckboxes.valueChanges.subscribe(() => {
      this.wizardService.updateDidSelection(this.calculateSelectedDids());
    });

    effect(() => {
      const available = this.availableDids();
      const fieldState = this.wizardService.fieldState('didSelection');
      const selected = new Set(
        this.wizardService
          .submission()
          ?.proofOfPossessionList.map(pop => pop.did ?? '')
          .filter(Boolean) ?? []
      );

      this.form.controls.didCheckboxes.clear({emitEvent: false});
      available.forEach(item => {
        const did = item.did ?? '';
        this.form.controls.didCheckboxes.push(this.fb.nonNullable.control(selected.has(did)), {emitEvent: false});
      });
      this.form.controls.didCheckboxes.updateValueAndValidity({emitEvent: false});
      applyFieldState(this.form, fieldState);
      applyFieldState(this.form.controls.didCheckboxes, fieldState);
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
            this.availableDids.set(result.content.filter(value => value.did !== undefined));
          }
        }
      });
  }

  override async validate(): Promise<boolean> {
    const valid = this.isValid();
    if (!valid) {
      this.form.markAllAsTouched();
    }
    return valid;
  }

  override isValid(): boolean {
    return this.form.disabled ? this.hasAtLeastOneSelectedDid() : this.form.valid;
  }

  /**
   * The cell context of `matCellDef` does not expose the row index, therefore the checkbox control is
   * resolved through the position of the identifier within the available DIDs.
   */
  protected checkboxControlFor(identifier: IdentifierResponse): FormControl<boolean> {
    return this.form.controls.didCheckboxes.at(this.availableDids().indexOf(identifier));
  }

  private calculateSelectedDids(): string[] {
    return this.availableDids()
      .map((item, index) => (this.form.controls.didCheckboxes.at(index)?.value ? (item.did ?? '') : null))
      .filter((did): did is string => !!did);
  }

  private hasAtLeastOneSelectedDid(): boolean {
    return this.calculateSelectedDids().length > 0;
  }

  private requireAtLeastOneSelected(control: AbstractControl): {required: true} | null {
    const values = control.value as boolean[] | undefined;
    return Array.isArray(values) && values.some(Boolean) ? null : {required: true};
  }

  protected readonly AppRoutes = AppRoutes;
}
