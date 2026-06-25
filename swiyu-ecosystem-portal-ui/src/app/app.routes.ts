import {Routes} from '@angular/router';
import {ObUnsavedChangesGuard} from '@oblique/oblique';
import {featureToggleActiveGuard} from './core/featuretoggle/feature-toggle-active.guard';
import {FEATURE_TOGGLE} from './core/featuretoggle/feature-toggle-enum';
import {AdministrationOverviewComponent} from './pages/administration-overview/administration-overview.component';
import {BusinessPartnerDetailComponent} from './pages/business-partner-detail/business-partner-detail.component';
import {BusinessPartnerProfileComponent} from './pages/business-partner-profile/business-partner-profile.component';
import {canActivateTrustBaseUrl, canActivateTrustStep} from './pages/onboarding/trust/guards/trust-step.guard';
import {TrustIntroductionComponent} from './pages/onboarding/trust/introduction/trust-introduction.component';
import {OnboardingStepDidsComponent} from './pages/onboarding/trust/steps/onboarding-step-dids-component/onboarding-step-dids.component';
import {OnboardingStepDocumentsComponent} from './pages/onboarding/trust/steps/onboarding-step-documents-component/onboarding-step-documents.component';
import {OnboardingStepFinalComponent} from './pages/onboarding/trust/steps/onboarding-step-final-component/onboarding-step-final.component';
import {OnboardingStepOrganisationDetailsComponent} from './pages/onboarding/trust/steps/onboarding-step-organisation-details-component/onboarding-step-organisation-details.component';
import {OnboardingStepTechnicalVerificationComponent} from './pages/onboarding/trust/steps/onboarding-step-technical-verification-component/onboarding-step-technical-verification.component';
import {TrustOnboardingWizardComponent} from './pages/onboarding/trust/wizard/trust-onboarding-wizard.component';
import {AdditionalDidsExplainerComponent} from './pages/organizations/additional-dids-explainer/additional-dids-explainer.component';
import {DidDetailsComponent} from './pages/organizations/did-details/did-details.component';
import {DidSetupComponent} from './pages/organizations/did-setup/did-setup.component';
import {OrganizationOverviewComponent} from './pages/organizations/organization-overview.component';
import {
  canActivateBaseStepWithoutPartner,
  canActivateBaseStepWithPartner
} from './pages/partners/registration/guards/base-step.guard';
import {PartnerRegistrationIntroductionComponent} from './pages/partners/registration/introduction/partner-registration-introduction.component';
import {PartnerRegistrationHandoverStepComponent} from './pages/partners/registration/steps/partner-registration-handover-step/partner-registration-handover-step.component';
import {PartnerRegistrationStepPaymentComponent} from './pages/partners/registration/steps/partner-registration-step-payment/partner-registration-step-payment.component';
import {PartnerRegistrationStepProductSelectionComponent} from './pages/partners/registration/steps/partner-registration-step-product-selection/partner-registration-step-product-selection.component';
import {PartnerRegistrationStepProfileCreationComponent} from './pages/partners/registration/steps/partner-registration-step-profile-creation/partner-registration-step-profile-creation.component';
import {PartnerRegistrationWizardComponent} from './pages/partners/registration/wizard/partner-registration-wizard.component';

/**
 * Collection of convenience parameter and type safe methods to navigate in the app
 */
export class AppRoutes {
  static baseOnboardingIntroduction() {
    return ['/', 'onboarding', 'base'];
  }

  static baseOnboardingWizard() {
    return ['/', 'onboarding', 'base', 'register'];
  }

  static baseOnboardingProductSelection() {
    return ['/', 'onboarding', 'base', 'register', 'productselection'];
  }

  static baseOnboardingProfileCreation() {
    return ['/', 'onboarding', 'base', 'register', 'profilecreation'];
  }

  static baseOnboardingPayment(partnerId: string) {
    return ['/', 'onboarding', 'base', 'register', partnerId, 'payment'];
  }

  static baseOnboardingHandover(partnerId: string) {
    return ['/', 'onboarding', 'base', 'register', partnerId, 'handover'];
  }

  static trustOnboardingIntroduction(partnerId: string) {
    return ['/', 'onboarding', 'trust', partnerId, 'introduction'];
  }

  static trustOnboardingWizard(partnerId: string, submissionId: string) {
    return ['/', 'onboarding', 'trust', partnerId, submissionId];
  }

  static trustOnboardingProfile(partnerId: string, submissionId: string) {
    return ['/', 'onboarding', 'trust', partnerId, submissionId, 'profile'];
  }

  static trustOnboardingDids(partnerId: string, submissionId: string) {
    return ['/', 'onboarding', 'trust', partnerId, submissionId, 'dids'];
  }

  static trustOnboardingFormalProof(partnerId: string, submissionId: string) {
    return ['/', 'onboarding', 'trust', partnerId, submissionId, 'formal-proof'];
  }

  static trustOnboardingTechnicalProof(partnerId: string, submissionId: string) {
    return ['/', 'onboarding', 'trust', partnerId, submissionId, 'technical-proof'];
  }

  static trustOnboardingApproval(partnerId: string, submissionId: string) {
    return ['/', 'onboarding', 'trust', partnerId, submissionId, 'approval'];
  }

  static businessPartnerOverview() {
    return ['/', 'organizations'];
  }

  static businessPartnerOverviewV2() {
    return ['/', 'business-partners'];
  }

  static businessPartnerDetail(partnerId: string) {
    return ['/', 'business-partners', partnerId];
  }

  static businessPartnerEdit(partnerId: string) {
    return ['/', 'business-partners', partnerId, 'edit'];
  }

  static identifierDetail(partnerId: string, identifierEntryId: string) {
    return ['/', 'business-partners', partnerId, 'identifier', identifierEntryId];
  }

  static identifierSetup(partnerId: string) {
    return ['/', 'business-partners', partnerId, 'identifier'];
  }

  static additionalDidsExplainer(partnerId: string) {
    return ['/', 'business-partners', partnerId, 'verify-dids'];
  }
}

export const routes: Routes = [
  {
    path: 'onboarding',
    canMatch: [featureToggleActiveGuard],
    data: {guardFeature: FEATURE_TOGGLE.EIDARTFE_1122},
    children: [
      {
        path: 'trust',
        children: [
          {
            /** @see trustOnboardingIntroduction() **/
            path: ':businessPartnerId/introduction',
            component: TrustIntroductionComponent,
            data: {title: 'eportal_onboardingTR_overview_pageTitle'}
          },
          {
            /** @see trustOnboardingWizard() **/
            path: ':partnerId/:submissionId',
            component: TrustOnboardingWizardComponent,
            canDeactivate: [ObUnsavedChangesGuard],
            children: [
              {
                path: '',
                canActivate: [canActivateTrustBaseUrl],
                component: OnboardingStepOrganisationDetailsComponent
              },
              {
                /** @see trustOnboardingProfile() **/
                path: 'profile',
                component: OnboardingStepOrganisationDetailsComponent,
                data: {title: 'app_site_onboarding_trust_organisation-information_title'}
              },
              {
                /** @see trustOnboardingDids() **/
                path: 'dids',
                component: OnboardingStepDidsComponent,
                canActivate: [canActivateTrustStep],
                data: {title: 'eportal_onboardingTR_selectDID_pageTitle'}
              },
              {
                /** @see trustOnboardingFormalProof() **/
                path: 'formal-proof',
                component: OnboardingStepDocumentsComponent,
                canActivate: [canActivateTrustStep],
                data: {title: 'eportal_onboardingTR_formalProof_pageTitle'}
              },
              {
                /** @see trustOnboardingTechnicalProof() **/
                path: 'technical-proof',
                component: OnboardingStepTechnicalVerificationComponent,
                canActivate: [canActivateTrustStep],
                data: {title: 'eportal_onboardingTR_technicalProof_pageTitle'}
              },
              {
                /** @see trustOnboardingApproval() **/
                path: 'approval',
                component: OnboardingStepFinalComponent,
                canActivate: [canActivateTrustStep],
                data: {title: 'eportal_onboardingTR_automaticVerification_submitted_pageTitle'}
              }
            ]
          }
        ]
      },
      {
        path: 'base',
        children: [
          {
            /** @see baseOnboardingIntroduction() **/
            path: '',
            component: PartnerRegistrationIntroductionComponent,
            data: {title: 'eportal_onboarding_start_pageTitle'}
          },
          {
            /** @see baseOnboardingWizard() **/
            path: 'register',
            component: PartnerRegistrationWizardComponent,
            canDeactivate: [ObUnsavedChangesGuard],
            children: [
              {
                path: '',
                redirectTo: 'productselection',
                pathMatch: 'full'
              },
              {
                /** @see baseOnboardingProductSelection() **/
                path: 'productselection',
                component: PartnerRegistrationStepProductSelectionComponent,
                data: {title: 'eportal_onboarding_product_pageTitle'}
              },
              {
                /** @see baseOnboardingProfileCreation() **/
                path: 'profilecreation',
                component: PartnerRegistrationStepProfileCreationComponent,
                canActivate: [canActivateBaseStepWithoutPartner],
                data: {title: 'eportal_onboarding_profile_pageTitle'}
              },
              {
                /** @see baseOnboardingPayment() **/
                path: ':partnerId/payment',
                component: PartnerRegistrationStepPaymentComponent,
                canActivate: [canActivateBaseStepWithPartner],
                data: {title: 'eportal_onboarding_payment_pageTitle'}
              },
              {
                /** @see baseOnboardingHandover() **/
                path: ':partnerId/handover',
                component: PartnerRegistrationHandoverStepComponent,
                canActivate: [canActivateBaseStepWithPartner],
                data: {title: 'eportal_onboarding_development_pageTitle'}
              }
            ]
          }
        ]
      }
    ]
  },
  {
    /** @see businessPartnerOverviewV2() **/
    path: 'business-partners',
    canMatch: [featureToggleActiveGuard],
    data: {guardFeature: FEATURE_TOGGLE.EIDARTFE_1122},
    children: [
      {
        path: '',
        component: AdministrationOverviewComponent,
        data: {title: 'eportal_adminOverview_pageTitle'}
      },
      {
        /** @see businessPartnerDetail() **/
        path: ':businessPartnerId',
        canDeactivate: [ObUnsavedChangesGuard],
        children: [
          {
            path: '',
            component: BusinessPartnerDetailComponent,
            data: {title: 'app_route_title_business_partner_detail'}
          },
          {
            /** @see businessPartnerEdit() **/
            path: 'edit',
            component: BusinessPartnerProfileComponent,
            data: {title: 'app_site_updateOrganization_title'}
          },
          {
            /** @see identifierSetup() **/
            path: 'identifier',
            children: [
              {
                path: '',
                component: DidSetupComponent,
                data: {title: 'eportal_onboarding_didInstruction_pageTitle'}
              },
              {
                /** @see identifierDetail() **/
                path: ':identifierEntryId',
                component: DidDetailsComponent,
                data: {title: 'app_site_did-details_title'}
              }
            ]
          },
          {
            /** @see additionalDidsExplainer() **/
            path: 'verify-dids',
            component: AdditionalDidsExplainerComponent,
            data: {title: 'eportal_verifyAdditionalDIDs_pageTitle'}
          }
        ]
      }
    ]
  },
  {
    /** @see businessPartnerOverview() **/
    path: 'organizations',
    component: OrganizationOverviewComponent,
    data: {title: 'app_site_overview_title'}
  },
  {path: '**', redirectTo: 'business-partners', pathMatch: 'full'}, // Only matches if route business-partners is feature enabled
  {path: '**', redirectTo: 'organizations', pathMatch: 'full'}
];
