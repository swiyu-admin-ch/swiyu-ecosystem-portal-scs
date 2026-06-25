import {Component, input, InputSignal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-onboarding-step-automatic-final',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './onboarding-step-automatic-final.component.html',
  styleUrls: ['../onboarding-steps.scss']
})
export class OnboardingStepAutomaticFinalComponent {
  partnerName: InputSignal<string> = input.required<string>();
}
