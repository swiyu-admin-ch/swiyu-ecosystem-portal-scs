import {Component, input} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IdentifierStatus} from '../../api/generated';

@Component({
  selector: 'app-identifier-base-onboarding-status',
  imports: [MatChipsModule, MatIconModule, TranslatePipe],
  templateUrl: './identifier-base-onboarding-status.component.html',
  styleUrl: './identifier-base-onboarding-status.component.scss'
})
export class IdentifierBaseOnboardingStatusComponent {
  readonly identifierStatus = input.required<IdentifierStatus>();

  protected readonly IdentifierStatus = IdentifierStatus;
}
