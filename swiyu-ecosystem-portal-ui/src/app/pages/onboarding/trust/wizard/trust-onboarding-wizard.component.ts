import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {filter, Subscription} from 'rxjs';
import {AbstractOnboardingStepComponent} from '../steps/abstract-onboarding-step-component';
import {TRUST_STEP_MAP, TrustOnboardingWizardService} from './trust-onboarding-wizard.service';

@Component({
  selector: 'app-trust-onboarding-wizard',
  templateUrl: './trust-onboarding-wizard.component.html',
  styleUrls: ['./trust-onboarding-wizard.component.scss'],
  providers: [TrustOnboardingWizardService],
  imports: [MatIconModule, MatStepperModule, TranslateModule, RouterOutlet]
})
export class TrustOnboardingWizardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper: MatStepper | undefined;
  protected readonly service = inject(TrustOnboardingWizardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private routeSub: Subscription | undefined;
  private activeStepComponent: AbstractOnboardingStepComponent | null = null;

  ngOnInit() {
    const partnerId = this.route.snapshot.paramMap.get('partnerId');
    const submissionId = this.route.snapshot.paramMap.get('submissionId');
    if (partnerId && submissionId) {
      this.service.init(partnerId, submissionId);
    }
  }

  ngAfterViewInit() {
    this.applyStepperA11y();
    this.syncStepperWithRoute();
    this.routeSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.syncStepperWithRoute();
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
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

  // Reads the current child route segment (e.g. "formal-proof") and updates the stepper's selected index to match.
  private syncStepperWithRoute(): void {
    if (!this.stepper) {
      return;
    }
    const child = this.route.firstChild;
    if (!child) {
      return;
    }
    const segments = child.snapshot.url;
    const segment = segments[0]?.path;
    const stepIndex = TRUST_STEP_MAP[segment];
    if (stepIndex !== undefined) {
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
}
