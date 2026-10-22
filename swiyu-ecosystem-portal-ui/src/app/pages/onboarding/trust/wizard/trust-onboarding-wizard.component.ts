import {AfterViewInit, Component, DestroyRef, effect, ElementRef, inject, input, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIconModule} from '@angular/material/icon';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {filter} from 'rxjs';
import {AbstractOnboardingStepComponent} from '../steps/abstract-onboarding-step-component';
import {TrustOnboardingWizardService} from './trust-onboarding-wizard.service';

@Component({
  selector: 'app-trust-onboarding-wizard',
  templateUrl: './trust-onboarding-wizard.component.html',
  styleUrls: ['./trust-onboarding-wizard.component.scss'],
  providers: [TrustOnboardingWizardService],
  imports: [MatIconModule, MatStepperModule, TranslateModule, RouterOutlet]
})
export class TrustOnboardingWizardComponent implements AfterViewInit {
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private stepperInstance: MatStepper | undefined;
  @ViewChild('stepper')
  set stepper(stepper: MatStepper | undefined) {
    this.stepperInstance = stepper;

    if (stepper) {
      // The stepper is rendered only after the submission is loaded. On reloads the flow can already
      // be ready before this ViewChild exists, so we must sync again as soon as the stepper appears.
      this.applyStepperA11y();
      this.updateStepSelectionFromRoute();
    }
  }

  get stepper(): MatStepper | undefined {
    return this.stepperInstance;
  }
  readonly partnerId = input<string>();
  readonly submissionId = input<string>();
  protected readonly service = inject(TrustOnboardingWizardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly initWizardEffect = effect(() => {
    const partnerId = this.partnerId();
    const submissionId = this.submissionId();

    if (partnerId && submissionId) {
      this.service.init(partnerId, submissionId);
    }
  });
  private activeStepComponent: AbstractOnboardingStepComponent | null = null;

  ngAfterViewInit() {
    // Initial reload sync happens in the `stepper` ViewChild setter when the gated stepper is created.
    // Afterwards only route changes need to re-apply the route-derived selected step.
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateStepSelectionFromRoute();
      });
    this.translateSetup();
  }

  onStepActivated(component: unknown): void {
    if (component instanceof AbstractOnboardingStepComponent) {
      this.service.setActiveStep(component);
      this.activeStepComponent = component;
    } else {
      this.service.setActiveStep(null);
      this.activeStepComponent = null;
    }
  }

  // Reads the active child route segment, maps it to the currently visible steps of the loaded flow
  // and applies the resulting selection to the stepper and wizard state.
  private updateStepSelectionFromRoute(): void {
    if (!this.stepper) {
      return;
    }
    if (!this.service.submission()) {
      return;
    }
    const child = this.route.firstChild;
    if (!child) {
      return;
    }
    const visibleSteps = this.service.visibleSteps();
    if (visibleSteps.length === 0) {
      return;
    }
    const segments = child.snapshot.url;
    const segment = segments[0]?.path;
    const stepIndex = visibleSteps.findIndex(step => step.id === segment);
    if (stepIndex >= 0) {
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
    if (this.activeStepComponent && this.stepper) {
      this.activeStepComponent.stepNumber = this.stepper.selectedIndex + 1;
      this.activeStepComponent.totalSteps = this.stepper.steps.length;
    }
  }

  private translateSetup() {
    this.translateService.get('app_site_onboarding_trust_organisation-information_step');
    this.translateService.get('app_site_onboarding_trust_dids_step');
    this.translateService.get('app_site_onboarding_trust_documents_step');
    this.translateService.get('app_site_onboarding_trust_technical-verification_step');
    this.translateService.get('app_site_onboarding_trust_final_step');
    this.translateService.get('eportal_site_onboarding_trust_final_automatic_step');
  }
}
