import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ObAlertComponent} from '@oblique/oblique';

export interface ProcessLink {
  label: string;
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  icon?: string; // e.g. 'link_external'
}

export type AlertType = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-process-step',
  standalone: true,
  imports: [CommonModule, MatIcon, ObAlertComponent],
  templateUrl: './process-step.component.html',
  styleUrl: './process-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Applies the parent component template
    // Reuse styles from process.component.scss via class names
    class: 'steps-card'
  }
})
export class ProcessStepComponent {
  step = input.required<number>();
  title = input.required<string>();
  subtitle = input<string | undefined>();

  alertType = input<AlertType>('info');
  alertText = input<string | undefined>();

  description = input<string | undefined>();
  links = input<ProcessLink[] | undefined>();
}
