import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {filter, Subscription} from 'rxjs';
import {AbstractOnboardingStepComponent} from '../../../onboarding/trust/steps/abstract-onboarding-step-component';
import {
  PROTECTED_VERIFICATION_STEP_MAP,
  ProtectedVerificationWizardService
} from './protected-verification-wizard.service';

@Component({
  selector: 'app-protected-verification-wizard',
  templateUrl: './protected-verification-wizard.component.html',
  styleUrls: ['./protected-verification-wizard.component.scss'],
  providers: [ProtectedVerificationWizardService],
  imports: [MatIconModule, MatStepperModule, TranslateModule, RouterOutlet]
})
export class ProtectedVerificationWizardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper: MatStepper | undefined;
  protected readonly service = inject(ProtectedVerificationWizardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private routeSub: Subscription | undefined;
  private activeStepComponent: AbstractOnboardingStepComponent | null = null;

  ngOnInit() {
    const partnerId = this.route.snapshot.paramMap.get('businessPartnerId');
    if (partnerId) {
      this.service.init(partnerId);
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

  // Reads the current child route segment (e.g. "confirmation") and updates the stepper's selected index to match.
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
    const stepIndex = PROTECTED_VERIFICATION_STEP_MAP[segment];
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
