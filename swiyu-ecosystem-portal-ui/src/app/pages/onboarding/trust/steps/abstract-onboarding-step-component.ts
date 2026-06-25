export abstract class AbstractOnboardingStepComponent {
  stepNumber = 0;
  totalSteps = 0;

  abstract validate(): Promise<boolean>;

  isValid(): boolean {
    return true;
  }
}
