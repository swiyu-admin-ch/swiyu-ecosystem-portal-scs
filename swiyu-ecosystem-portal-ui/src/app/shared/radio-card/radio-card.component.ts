import {Component, EventEmitter, input, Output} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';

@Component({
  selector: 'app-radio-card',
  imports: [MatCard, MatCardContent],
  templateUrl: './radio-card.component.html',
  styleUrl: './radio-card.component.scss'
})
export class RadioCardComponent {
  dataCy = input.required();
  value = input.required();
  checked = input<boolean>(false);
  hasError = input<boolean>(false);
  disabled = input<boolean>(false);
  @Output() cardSelect = new EventEmitter<void>();

  onCardInteraction() {
    if (this.disabled() || this.checked()) {
      return;
    }
    this.cardSelect.emit();
  }

  onKeyBoardInteraction(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardInteraction();
    }
  }
}
