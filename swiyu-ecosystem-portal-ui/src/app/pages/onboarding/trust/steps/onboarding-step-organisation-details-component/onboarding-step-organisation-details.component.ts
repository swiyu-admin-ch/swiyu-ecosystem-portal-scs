import {ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatHint, MatInput} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatOption, MatSelect} from '@angular/material/select';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  ObButtonModule,
  ObMatErrorDirective,
  ObSelectableGroupDirective,
  ObUnsavedChangesDirective
} from '@oblique/oblique';
import {combineLatest, map, startWith} from 'rxjs';
import {
  PartnerCreationRequest,
  Signatory,
  TrustOnboardingSubmission,
  TrustOnboardingSubmissionRequest
} from '../../../../../api/generated';
import {AppConfigService} from '../../../../../core/appconfig/app-config.service';
import {CountryService} from '../../../../../core/util/country.service';
import {CheckboxA11yDirective} from '../../../../../shared/checkbox-a11y/checkbox-a11y.directive';
import {FullLangPipe} from '../../../../../shared/full-lang/full-lang.pipe';
import {InfoIconComponent} from '../../../../../shared/info-icon/info-icon.component';
import {RadioCardComponent} from '../../../../../shared/radio-card/radio-card.component';
import {CustomValidators} from '../../../../../shared/validators/custom-validators';
import {TrustOnboardingWizardService} from '../../wizard/trust-onboarding-wizard.service';
import {AbstractOnboardingStepComponent} from '../abstract-onboarding-step-component';
import PartnerTypeEnum = PartnerCreationRequest.BusinessPartnerTypeEnum;
import SigningRuleEnum = TrustOnboardingSubmissionRequest.SigningRuleEnum;
import CorrespondingLanguageEnum = TrustOnboardingSubmissionRequest.CorrespondingLanguageEnum;

type SignatoryFormGroup = FormGroup<{
  [K in keyof Signatory]: FormControl<Signatory[K]>;
}>;

@Component({
  selector: 'app-onboarding-step-organisation-details',
  imports: [
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ObMatErrorDirective,
    MatHint,
    TranslateModule,
    MatIcon,
    MatSelect,
    MatOption,
    FormsModule,
    MatCheckbox,
    CheckboxA11yDirective,
    ObSelectableGroupDirective,
    RadioCardComponent,
    ObUnsavedChangesDirective,
    MatButtonModule,
    ObButtonModule,
    InfoIconComponent,
    FullLangPipe
  ],
  templateUrl: './onboarding-step-organisation-details.component.html',
  styleUrls: ['../onboarding-steps.scss'],
  providers: [{provide: AbstractOnboardingStepComponent, useExisting: OnboardingStepOrganisationDetailsComponent}],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingStepOrganisationDetailsComponent extends AbstractOnboardingStepComponent implements OnInit {
  protected readonly wizardService = inject(TrustOnboardingWizardService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly countryService = inject(CountryService);
  protected readonly appConfigService = inject(AppConfigService);
  protected readonly PartnerTypeSelection = PartnerTypeEnum;
  protected readonly signingRule = SigningRuleEnum;
  protected readonly signingRuleOptions = Object.values(this.signingRule);
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private previousPartnerType: string | undefined;

  readonly languages: string[] = Object.values(CorrespondingLanguageEnum);
  readonly form = this.fb.group({
    partnerType: this.fb.control<PartnerTypeEnum | null>(null, Validators.required),
    hasUid: this.fb.control<boolean>(false),
    entityDefaultName: this.fb.control<string>('', [Validators.required, CustomValidators.notBlank()]),
    entityAddress: this.fb.group({
      street: ['', CustomValidators.emptyOrNotBlank()],
      postalCode: ['', [Validators.required, CustomValidators.swissZipCode()]],
      city: ['', [Validators.required, CustomValidators.notBlank()]],
      country: ['CH', Validators.required]
    }),
    contactPerson: this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.notBlank()]],
      lastName: ['', [Validators.required, CustomValidators.notBlank()]],
      email: ['', [Validators.required, CustomValidators.notBlank(), Validators.email]],
      phone: ['', [Validators.required, CustomValidators.notBlank(), CustomValidators.internationalPhoneNumber()]],
      correspondingLanguage: this.fb.control<CorrespondingLanguageEnum | null>(null, Validators.required)
    }),
    signingRule: this.fb.control<SigningRuleEnum | null>(SigningRuleEnum.JointSignatureTwo),
    signatories: this.fb.array<SignatoryFormGroup>([]),
    uid: this.fb.control<string>(''),
    readTermsAndConditions: this.fb.control<boolean>(false, Validators.requiredTrue),
    readPrivacyPolicy: this.fb.control<boolean>(false, Validators.requiredTrue)
  });
  readonly partnerTypeGovDisabled = computed(() => false);

  constructor() {
    super();
    this.translateSetup();
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())).subscribe(value => {
      this.wizardService.updateOrganisationData({
        partnerId: this.wizardService.partnerId ?? undefined,
        entityName: {
          de: value.entityDefaultName,
          fr: value.entityDefaultName,
          it: value.entityDefaultName,
          en: value.entityDefaultName,
          rm: value.entityDefaultName
        },
        entityAddress: {
          street: value.entityAddress.street,
          country: value.entityAddress.country,
          city: value.entityAddress.city,
          postalCode: value.entityAddress.postalCode,
          region: undefined
        },
        contactPerson: {
          firstName: value.contactPerson.firstName,
          lastName: value.contactPerson.lastName,
          email: value.contactPerson.email,
          phone: value.contactPerson.phone,
          address: undefined
        },
        entityEmail: value.contactPerson.email,
        signingRule: value.signingRule ?? undefined,
        signatories: value.signatories,
        registryIds: {
          UID: value.uid
        },
        isRegisteredInCommercialRegister: value.hasUid,
        correspondingLanguage: value.contactPerson.correspondingLanguage ?? 'DE',
        dids: undefined,
        requestedPartnerType: value.partnerType ?? undefined
      });
    });
    effect(() => {
      const data = this.wizardService.submission();
      if (data) {
        // Initilize signatory amount based on amount in existing data
        this.updateSignatoryForms(data.signingRule ?? null);
        this.form.patchValue(
          {
            // partnerType is not set here because it is determined by the wizardService
            hasUid: data?.isRegisteredInCommercialRegister,
            entityDefaultName: data.entityName?.de,
            entityAddress: {
              street: data.entityAddress?.street,
              country: data.entityAddress?.country ?? 'CH',
              city: data.entityAddress?.city,
              postalCode: data.entityAddress?.postalCode
            },
            contactPerson: {
              firstName: data.contactPerson?.firstName,
              lastName: data.contactPerson?.lastName,
              phone: data.contactPerson?.phone,
              email: data.contactPerson?.email,
              correspondingLanguage: data?.correspondingLanguage // FIX LATER
            },
            signingRule: data?.signingRule,
            signatories: data?.signatories,
            uid: data.registryIds['UID'],
            readTermsAndConditions: false,
            readPrivacyPolicy: false
          },
          {emitEvent: true}
        );
        // When facing new trust onboarding submission apply default behaviour with two signatories
        // Default signing rule is joint-signature by two people and no signing rule for individuals
        if (!data.signingRule && data.businessPartnerType != PartnerTypeEnum.Individual) {
          this.form.controls.signingRule.setValue(TrustOnboardingSubmission.SigningRuleEnum.JointSignatureTwo);
          this.updateSignatoryForms(TrustOnboardingSubmission.SigningRuleEnum.JointSignatureTwo);
        }
      }
    });
    effect(() => {
      const partnerType = this.wizardService.requestedBusinessPartnerType();
      if (partnerType) {
        this.form.patchValue({partnerType: partnerType});
      }
    });
    effect(() => {
      const partner = this.wizardService.businessPartner();
      const submission = this.wizardService.submission();
      if (!partner) {
        return;
      }

      this.form.patchValue({
        entityDefaultName: submission?.entityName?.de ?? partner.name,
        entityAddress: submission?.entityAddress ?? partner.address,
        uid: submission?.registryIds?.['UID'] ?? partner.uid
      });
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

  ngOnInit(): void {
    this.form.controls.signingRule.valueChanges
      .pipe(startWith(this.form.controls.signingRule.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.updateSignatoryForms(value);
      });
    this.form.controls.partnerType.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(partnerType => {
      const previousPartnerType = this.previousPartnerType;
      this.previousPartnerType = partnerType ?? undefined;

      if (partnerType == PartnerTypeEnum.Individual) {
        this.form.controls.signingRule.setValue(null);
      } else if (!this.form.value.signingRule) {
        // When facing new trust onboarding submission apply default behaviour with two signatories
        this.form.controls.signingRule.setValue(TrustOnboardingSubmission.SigningRuleEnum.JointSignatureTwo);
        this.updateSignatoryForms(TrustOnboardingSubmission.SigningRuleEnum.JointSignatureTwo);
      }

      // hasUid is only user-controlled for Business.
      if (partnerType !== PartnerTypeEnum.Business && this.form.controls.hasUid.value === true) {
        this.form.controls.hasUid.setValue(false, {emitEvent: false});
      }

      // If user comes back to Business from another partner type, restore hasUid=true.
      if (
        partnerType === PartnerTypeEnum.Business &&
        previousPartnerType !== undefined &&
        previousPartnerType !== PartnerTypeEnum.Business &&
        this.form.controls.hasUid.value === false
      ) {
        this.form.controls.hasUid.setValue(true);
      }
    });

    combineLatest([
      this.form.controls.partnerType.valueChanges.pipe(startWith(this.form.controls.partnerType.value)),
      this.form.controls.hasUid.valueChanges.pipe(startWith(this.form.controls.hasUid.value))
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([partnerType, hasUid]) => {
        this.applyUidRules(partnerType, hasUid === true);
      });
  }

  copyContactPerson() {
    const firstSignatory = this.form.controls.signatories.controls[0];
    if (!firstSignatory) {
      return;
    }

    firstSignatory.controls.firstName.setValue(this.form.controls.contactPerson.controls.firstName.value);
    firstSignatory.controls.lastName.setValue(this.form.controls.contactPerson.controls.lastName.value);
    firstSignatory.controls.phone.setValue(this.form.controls.contactPerson.controls.phone.value);
    firstSignatory.controls.email.setValue(this.form.controls.contactPerson.controls.email.value);
  }

  private applyUidRules(partnerType: string | undefined | null, hasUid: boolean) {
    const uid = this.form.controls.uid;
    const uidMustBeProvided =
      partnerType === PartnerTypeEnum.GovernmentalInstitution || (partnerType === PartnerTypeEnum.Business && hasUid);

    if (uidMustBeProvided) {
      uid.enable({emitEvent: false});
      uid.setValidators([Validators.required, CustomValidators.swissUid()]);
    } else {
      uid.disable({emitEvent: false});
      uid.clearValidators();
      uid.setValue('', {emitEvent: false});
    }
    uid.updateValueAndValidity({emitEvent: false});
  }

  private updateSignatoryForms(signingRule: SigningRuleEnum | null) {
    if (!signingRule) {
      this.form.controls.signatories.clear();
      return;
    }

    const currentCount = this.form.controls.signatories.controls.length;
    const newCount = this.getSignatoryCount(signingRule);
    if (currentCount === newCount) {
      return;
    }

    while (this.form.controls.signatories.controls.length > newCount) {
      this.form.controls.signatories.removeAt(newCount);
    }
    while (this.form.controls.signatories.controls.length < newCount) {
      this.form.controls.signatories.push(this.createSignatoryForm());
    }
  }

  private createSignatoryForm(): SignatoryFormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.notBlank()]],
      lastName: ['', [Validators.required, CustomValidators.notBlank()]],
      phone: ['', [Validators.required, CustomValidators.notBlank(), CustomValidators.internationalPhoneNumber()]],
      email: ['', [Validators.required, CustomValidators.notBlank(), Validators.email]]
    });
  }

  private getSignatoryCount(signingRule: SigningRuleEnum) {
    switch (signingRule) {
      case SigningRuleEnum.SingleSignature:
        return 1;
      case SigningRuleEnum.JointSignatureTwo:
        return 2;
      case SigningRuleEnum.JointSignatureThree:
        return 3;
    }
  }

  private translateSetup() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('eportal_global_country_CH');
    this.translateService.get('eportal_onboardingTR_addDetails_inputLabel_typeSignature_option_SINGLE_SIGNATURE');
    this.translateService.get('eportal_onboardingTR_addDetails_inputLabel_typeSignature_option_JOINT_SIGNATURE_TWO');
    this.translateService.get('eportal_onboardingTR_addDetails_inputLabel_typeSignature_option_JOINT_SIGNATURE_THREE');
  }
}
