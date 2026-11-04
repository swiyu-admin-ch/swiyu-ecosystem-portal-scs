import {FormErrors} from 'src/app/shared/error-summary/error-summary-configuration.helper';

export abstract class AbstractOnboardingStepComponent {
  stepNumber = 0;
  totalSteps = 0;
  onStepError!: (errors: FormErrors[]) => void;

  abstract validate(): Promise<boolean>;

  isValid(): boolean {
    return true;
  }
}
