import {inject, Injectable, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {filter, from, map, Observable, of, switchMap, tap} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  IdentifierApi,
  PagedModelIdentifierResponse,
  PartnerCreationRequest
} from '../../../../api/generated';
import {OrganizationService} from '../../../../api/organization.service';
import {AppRoutes} from '../../../../app.routes';
import {AppConfigService} from '../../../../core/appconfig/app-config.service';
import {AuthService} from '../../../../core/security/auth.service';
import {AbstractOnboardingStepComponent} from '../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {OauthMockRoleDialogComponent} from '../dialogs/oauth-mock-role-dialog/oauth-mock-role-dialog.component';

export type BaseStepLastSegment = 'productselection' | 'profilecreation' | 'payment' | 'handover';

const BASE_STEP_ORDER_WITH_PAYMENT = ['productselection', 'profilecreation', 'payment', 'handover'] as const;
const BASE_STEP_ORDER_WITHOUT_PAYMENT = ['productselection', 'profilecreation', 'handover'] as const;

const BASE_STEP_ROUTE_MAP: Record<
  BaseStepLastSegment,
  {requiresPartner: boolean; route: (partnerId: string) => string[]}
> = {
  productselection: {
    requiresPartner: false,
    route: () => AppRoutes.baseOnboardingProductSelection()
  },
  profilecreation: {
    requiresPartner: false,
    route: () => AppRoutes.baseOnboardingProfileCreation()
  },
  payment: {
    requiresPartner: true,
    route: partnerId => AppRoutes.baseOnboardingPayment(partnerId)
  },
  handover: {
    requiresPartner: true,
    route: partnerId => AppRoutes.baseOnboardingHandover(partnerId)
  }
};

export const getBaseStepLastSegments = (isPaymentEnabled: boolean): readonly BaseStepLastSegment[] =>
  isPaymentEnabled ? BASE_STEP_ORDER_WITH_PAYMENT : BASE_STEP_ORDER_WITHOUT_PAYMENT;

@Injectable()
export class PartnerRegistrationWizardService {
  private readonly router = inject(Router);
  private readonly organizationService = inject(OrganizationService);
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly identifierApi = inject(IdentifierApi);
  private readonly appConfigService = inject(AppConfigService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly areStepsEditable = signal(true);
  readonly identifierEntryId = signal<string | null>(null);
  readonly partner = signal<BusinessPartner | null>(null);
  readonly currentStepIndex = signal(0);
  partnerCreationRequest: PartnerCreationRequest | undefined;

  private activeStep: AbstractOnboardingStepComponent | null = null;
  private readonly profileCreationStepIndex = 1;

  get isPaymentEnabled(): boolean {
    return this.appConfigService.isFunctionalityPaymentEnabled;
  }

  setActiveStep(step: AbstractOnboardingStepComponent | null): void {
    this.activeStep = step;
  }

  // Reloads partner + first identifier after a full OAuth round-trip (dev / no silent refresh), when in-memory state was lost.
  hydrateFromPartnerRoute(partnerId: string | null): void {
    if (!partnerId) {
      return;
    }

    const current = this.partner();
    if (current?.id === partnerId) {
      if (this.identifierEntryId() !== null) {
        return;
      }
      this.getFirstIdentifierId()(current)
        .pipe(tap(() => this.areStepsEditable.set(false)))
        .subscribe();
      return;
    }

    this.businessPartnerApi
      .getBusinessPartner({businessPartnerId: partnerId})
      .pipe(
        tap(bp => this.partner.set(bp)),
        switchMap(bp => this.getFirstIdentifierId()(bp)),
        tap(() => this.areStepsEditable.set(false))
      )
      .subscribe();
  }

  saveAndNext(): void {
    from(this.validateStepIsValid())
      .pipe(
        filter(isValid => isValid),
        switchMap(() => {
          if (this.currentStepIndex() === this.profileCreationStepIndex && this.partnerCreationRequest) {
            return this.createProfile(this.partnerCreationRequest);
          } else {
            this.navigateToNextStep();
            return of(null);
          }
        })
      )
      .subscribe();
  }

  navigateToPreviousStep(): void {
    if (this.currentStepIndex() === 0) {
      this.router.navigate(AppRoutes.baseOnboardingIntroduction());
      return;
    }

    const targetSegment = this.getStepSegmentAt(this.currentStepIndex() - 1);
    if (!targetSegment) {
      return;
    }
    this.navigateToStepSegment(targetSegment, {fallbackToProductIfMissingPartner: true});
  }

  onSaveAndContinueLater(): void {
    if (!this.activeStep) {
      return;
    }

    if (!this.activeStep.isValid()) {
      this.router.navigate(AppRoutes.businessPartnerOverviewV2());
      return;
    }

    if (this.currentStepIndex() === this.profileCreationStepIndex && this.partnerCreationRequest) {
      this.createPartner(this.partnerCreationRequest).subscribe({
        next: partner => {
          this.partner.set(partner);
          this.router.navigate(AppRoutes.businessPartnerOverviewV2());
        }
      });
    } else {
      this.router.navigate(AppRoutes.businessPartnerOverviewV2());
    }
  }

  updatePartnerDetails(event: PartnerCreationRequest): void {
    this.partnerCreationRequest = event;
  }

  private createProfile(partnerCreationRequest: PartnerCreationRequest): Observable<PagedModelIdentifierResponse> {
    return this.createPartner(partnerCreationRequest).pipe(
      tap(partner => this.partner.set(partner)),
      switchMap(partner => {
        if (!this.appConfigService.tokenRefreshEnabled) {
          // A new Business Partner is not in the Token that gets issued from JEAPs OAuth-Mock Server.
          // Adding these roles manually, will overcome this issue. Only active on LOCAL and DEV environments.
          const roles = [
            `${partner.id}:ti_@trustonboardingsubmission_#read`,
            `${partner.id}:ti_@trustonboardingsubmission_#write`,
            `${partner.id}:ti_@businesspartner_#read`,
            `${partner.id}:ti_@businesspartner_#write`,
            `${partner.id}:ti_@identifier_#read`,
            `${partner.id}:ti_@identifier_#write`
          ];
          const returnUrl = this.getNextStepUrl(partner.id);
          const dialogRef = this.dialog.open(OauthMockRoleDialogComponent, {
            data: {roleValues: roles},
            disableClose: true
          });

          return dialogRef.afterClosed().pipe(
            tap(confirmed => {
              if (!confirmed) {
                return;
              }
              localStorage.clear();
              sessionStorage.clear();
              this.authService.startLoginFlowWithReturnUrl(returnUrl);
            }),
            map(() => ({}) as PagedModelIdentifierResponse)
          );
        }
        return this.authService.refreshToken().pipe(
          switchMap(() => this.getFirstIdentifierId()(partner)),
          tap(() => {
            this.areStepsEditable.set(false);
            this.navigateToNextStep();
          })
        );
      })
    );
  }

  private getFirstIdentifierId() {
    return (partner: BusinessPartner) =>
      this.identifierApi
        .getAllIdentifiersOfPartner({
          partnerId: partner.id,
          size: 1,
          page: 0,
          sort: ['createdAt,desc']
        })
        .pipe(tap(page => this.identifierEntryId.set(page.content?.[0]?.id ?? null)));
  }

  private createPartner(organisationRegistrationRequest: PartnerCreationRequest): Observable<BusinessPartner> {
    return this.organizationService.registerBusinessPartner(organisationRegistrationRequest);
  }

  private navigateToNextStep(): void {
    const targetSegment = this.getStepSegmentAt(this.currentStepIndex() + 1);
    if (!targetSegment) {
      return;
    }

    this.navigateToStepSegment(targetSegment);
  }

  private getStepSegmentAt(index: number): BaseStepLastSegment | undefined {
    const orderedSteps = getBaseStepLastSegments(this.isPaymentEnabled);
    return orderedSteps[index];
  }

  private navigateToStepSegment(
    segment: BaseStepLastSegment,
    options: {fallbackToProductIfMissingPartner?: boolean} = {}
  ): void {
    const target = BASE_STEP_ROUTE_MAP[segment];
    const partnerId = this.partner()?.id;

    if (target.requiresPartner && !partnerId) {
      if (options.fallbackToProductIfMissingPartner) {
        this.router.navigate(AppRoutes.baseOnboardingProductSelection());
      }
      return;
    }

    this.router.navigate(target.route(partnerId ?? ''));
  }

  private getNextStepUrl(partnerId: string): string {
    const nextSegment = this.getStepSegmentAt(this.currentStepIndex() + 1);
    if (!nextSegment) {
      return this.router.serializeUrl(this.router.createUrlTree(AppRoutes.baseOnboardingProductSelection()));
    }

    const target = BASE_STEP_ROUTE_MAP[nextSegment];
    return this.router.serializeUrl(this.router.createUrlTree(target.route(partnerId)));
  }

  private async validateStepIsValid(): Promise<boolean> {
    if (!this.activeStep) {
      return false;
    }
    return this.activeStep.validate();
  }
}
