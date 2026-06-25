import {DOCUMENT} from '@angular/common';
import {Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatError, MatHint, MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  ObButtonDirective,
  ObMatErrorDirective,
  ObNotificationModule,
  ObSelectableGroupDirective,
  ObUnsavedChangesDirective
} from '@oblique/oblique';
import {PartnerCreationRequest} from '../../../../../api/generated';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {UserProfileService} from '../../../../../core/user/user-profile.service';
import {CountryService} from '../../../../../core/util/country.service';
import {isIntegrationEnvironment} from '../../../../../core/util/environment-utils';
import {CheckboxA11yDirective} from '../../../../../shared/checkbox-a11y/checkbox-a11y.directive';
import {InfoIconComponent} from '../../../../../shared/info-icon/info-icon.component';
import {ProcessStepComponent} from '../../../../../shared/process/process-step/process-step.component';
import {ProcessComponent} from '../../../../../shared/process/process.component';
import {RadioCardComponent} from '../../../../../shared/radio-card/radio-card.component';
import {StatefulAlertComponent} from '../../../../../shared/stateful-alert/stateful-alert.component';
import {CustomValidators} from '../../../../../shared/validators/custom-validators';
import {AbstractOnboardingStepComponent} from '../../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {PartnerRegistrationWizardService} from '../../wizard/partner-registration-wizard.service';
import PartnerTypeEnum = PartnerCreationRequest.BusinessPartnerTypeEnum;

export interface PartnerRegistration {
  partnerType: PartnerTypeEnum | null | undefined;
  uid: string | null | undefined;
  name: string | null | undefined;
  street: string | null | undefined;
  zipCode: string | null | undefined;
  city: string | null | undefined;
  region: string | null | undefined;
  country: string | null | undefined;
  email: string | null | undefined;
  phone: string | null | undefined;
  confirmedCorrectness: boolean | null | undefined;
  readTermsAndConditions: boolean | null | undefined;
  readDataProtection: boolean | null | undefined;
}

@Component({
  selector: 'app-partner-registration-step-profile-creation',
  imports: [
    TranslatePipe,
    MatIcon,
    ObNotificationModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    MatInput,
    ObSelectableGroupDirective,
    MatHint,
    MatCheckbox,
    CheckboxA11yDirective,
    MatButton,
    MatError,
    ObButtonDirective,
    ObMatErrorDirective,
    StatefulAlertComponent,
    RadioCardComponent,
    ProcessComponent,
    ProcessStepComponent,
    ObUnsavedChangesDirective,
    MatTooltip,
    InfoIconComponent
  ],
  templateUrl: './partner-registration-step-profile-creation.component.html',
  styleUrls: ['./partner-registration-step-profile-creation.component.scss'],
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: PartnerRegistrationStepProfileCreationComponent}]
})
export class PartnerRegistrationStepProfileCreationComponent extends AbstractOnboardingStepComponent {
  protected readonly wizardService = inject(PartnerRegistrationWizardService);
  createPartnerNotificationShown = signal<boolean>(true);
  firstStepCompleted = signal<boolean>(false);
  protected readonly PartnerTypeSelection = PartnerTypeEnum;
  protected readonly countryService = inject(CountryService);
  private readonly fb = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly document = inject<Document>(DOCUMENT);

  readonly partnerTypeBusinessDisabled = computed(
    () => !this.appConfigService.isFunctionalityAllowPartnerBaseOnboardingBusinessEnabled
  );

  readonly partnerTypeIndividualDisabled = computed(
    () => !this.appConfigService.isFunctionalityAllowPartnerBaseOnboardingIndividualEnabled
  );

  readonly partnerTypeGovDisabled = computed(
    () => !this.appConfigService.isFunctionalityAllowPartnerBaseOnboardingGovernmentalEnabled
  );

  readonly isGovernmentalAllowlistUser = computed(
    () => this.userProfileService.userProfile$?.value?.isGovernmental ?? false
  );

  readonly isPreview = computed(() =>
    isIntegrationEnvironment(this.appConfigService.environments?.integrationBaseUrl, this.document.location)
  );
  readonly isPaymentEnabled = computed(() => this.appConfigService.isFunctionalityPaymentEnabled);
  private readonly destroyRef = inject(DestroyRef);
  showAllowlistProcess(): boolean {
    return (
      this.form.controls.partnerType.value === PartnerTypeEnum.GovernmentalInstitution &&
      !this.isGovernmentalAllowlistUser()
    );
  }

  readonly form = this.fb.group({
    partnerType: this.fb.control<PartnerTypeEnum | undefined>(undefined, Validators.required),
    uid: this.fb.control<string | undefined>(undefined, CustomValidators.swissUid()),
    name: this.fb.control<string>('', [Validators.required, CustomValidators.notBlank()]),
    street: this.fb.control<string>('', CustomValidators.emptyOrNotBlank()),
    zipCode: this.fb.control<string>('', [Validators.required, CustomValidators.swissZipCode()]),
    city: this.fb.control<string>('', [Validators.required, CustomValidators.notBlank()]),
    country: this.fb.control<string>('CH', Validators.required),
    email: this.fb.control<string>('', [Validators.required, Validators.email]),
    phone: this.fb.control<string>('', [Validators.required, CustomValidators.internationalPhoneNumber()]),
    confirmedCorrectness: this.fb.control<boolean>(false, Validators.requiredTrue),
    readTermsAndConditions: this.fb.control<boolean>(false, Validators.requiredTrue),
    readDataProtection: this.fb.control<boolean>(false, Validators.requiredTrue)
  });

  constructor() {
    super();
    this.translateSetup();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.form.valid) {
        const value = this.form.getRawValue();
        this.wizardService.updatePartnerDetails({
          organizationName: value.name!,
          addressZipCode: value.zipCode!,
          addressCity: value.city!,
          contactPhone: value.phone!,
          contactEmail: value.email!,
          businessPartnerType: value.partnerType!,
          addressStreet: value.street ?? undefined,
          addressCountry: value.country ?? undefined,
          addressRegion: '', // to be removed with EID-6270
          uid: value.uid ?? undefined
        });
      }
    });

    this.form.controls.partnerType.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(partnerType => {
      const uid = this.form.controls.uid;
      if (partnerType == PartnerTypeEnum.GovernmentalInstitution) {
        uid.setValidators([Validators.required, CustomValidators.swissUid()]);
      } else {
        uid.setValidators([CustomValidators.swissUid()]);
      }
      uid.updateValueAndValidity();
    });
  }

  override async validate(): Promise<boolean> {
    const isValid = this.form.valid;

    if (this.firstStepCompleted()) {
      if (!isValid) {
        this.form.markAllAsTouched();
      }

      return isValid;
    } else {
      this.form.controls.partnerType.markAsTouched();
      this.firstStepCompleted.set(this.form.controls.partnerType.valid);
      return false;
    }
  }

  override isValid(): boolean {
    return this.form.valid;
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_global_country_CH');
    this.translateService.get('eportal_onboarding_profile_infoText_organisation');
    this.translateService.get('eportal_onboarding_profile_infoText_organisation_preview');
  }
}
