import {ChangeDetectionStrategy, Component, computed, contentChildren, input} from '@angular/core';
import {ProcessStepComponent} from './process-step/process-step.component';

@Component({
  selector: 'app-process',
  standalone: true,
  // No extra imports needed; this component just projects content
  imports: [],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessComponent {
  title = input.required<string>();
  stepsPerRow = input<number>();
  steps = contentChildren(ProcessStepComponent);
  resolvedStepsPerRow = computed(() => this.stepsPerRow() ?? this.steps().length);

  private static idSeq = 0;
  readonly titleId = `process-title-${++ProcessComponent.idSeq}`;
}
