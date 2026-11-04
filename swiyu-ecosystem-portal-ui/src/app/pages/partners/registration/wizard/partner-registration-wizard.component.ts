import {AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, ViewChild} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {filter, Subscription} from 'rxjs';
import {FormErrors} from 'src/app/shared/error-summary/error-summary-configuration.helper';
import {ErrorSummaryComponent} from 'src/app/shared/error-summary/error-summary.component';
import {AbstractOnboardingStepComponent} from '../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {
  BaseStepLastSegment,
  getBaseStepLastSegments,
  PartnerRegistrationWizardService
} from './partner-registration-wizard.service';

@Component({
  selector: 'app-partner-registration-wizard',
  templateUrl: './partner-registration-wizard.component.html',
  styleUrl: './partner-registration-wizard.component.scss',
  providers: [PartnerRegistrationWizardService],
  imports: [TranslateModule, MatIconModule, MatStepperModule, RouterOutlet, ErrorSummaryComponent]
})
export class PartnerRegistrationWizardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(ErrorSummaryComponent) errorSummary!: ErrorSummaryComponent;
  protected readonly service = inject(PartnerRegistrationWizardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly elementRef = inject(ElementRef);
  private routeSub: Subscription | undefined;
  private activeStepComponent: AbstractOnboardingStepComponent | null = null;
  public readonly errors = signal<FormErrors[]>([]);
  public readonly ignoredSummaryLabels = ['confirmedCorrectness', 'readTermsAndConditions', 'readDataProtection'];

  ngAfterViewInit() {
    this.applyStepperA11y();
    this.syncStepperWithRoute();
    this.hydrateFromRoute();
    this.routeSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.syncStepperWithRoute();
      this.hydrateFromRoute();
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  onStepActivated(component: unknown): void {
    if (component instanceof AbstractOnboardingStepComponent) {
      this.service.setActiveStep(component);
      this.activeStepComponent = component;
      component.onStepError = this.handleStepError;
      this.errors.set([]);
    } else {
      this.service.setActiveStep(null);
      this.activeStepComponent = null;
    }
  }

  handleStepError = (errors: FormErrors[]): void => {
    if (errors.length > 0) {
      this.errors.set(errors);
      this.errorSummary.focus();
    } else {
      this.errors.set([]);
    }
  };

  private hydrateFromRoute(): void {
    const child = this.route.firstChild;
    if (!child) {
      return;
    }
    const partnerId = child.snapshot.paramMap.get('partnerId');
    this.service.hydrateFromPartnerRoute(partnerId);
  }

  // Reads the current child route segment (e.g. "productselection") and updates the stepper's selected index to match.
  private syncStepperWithRoute(): void {
    if (!this.stepper) {
      return;
    }
    const child = this.route.firstChild;
    if (!child) {
      return;
    }
    const segments = child.snapshot.url;
    const lastSegment = segments[segments.length - 1]?.path;
    const stepIndex = getBaseStepLastSegments(this.service.isPaymentEnabled).indexOf(
      lastSegment as BaseStepLastSegment
    );
    if (stepIndex !== -1) {
      this.stepper.selectedIndex = stepIndex;
      this.service.currentStepIndex.set(stepIndex);
      this.updateStepAriaInfo();
    }
  }

  private applyStepperA11y(): void {
    const container = this.elementRef.nativeElement.querySelector('.mat-horizontal-stepper-header-container');
    if (container) {
      container.setAttribute('inert', '');
      container.setAttribute('aria-hidden', 'true');
    }
  }

  private updateStepAriaInfo(): void {
    if (this.activeStepComponent) {
      this.activeStepComponent.stepNumber = this.stepper.selectedIndex + 1;
      this.activeStepComponent.totalSteps = this.stepper.steps.length;
    }
  }
}
