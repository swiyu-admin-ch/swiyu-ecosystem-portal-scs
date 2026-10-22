import {Component, computed, input} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {VerificationProgress, VerificationProgressStatus} from '../../api/generated';

@Component({
  selector: 'app-business-partner-trust-chip',
  imports: [MatChipsModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './business-partner-trust-chip.component.html',
  styleUrl: './business-partner-trust-chip.component.scss'
})
export class BusinessPartnerTrustChipComponent {
  readonly progress = input<VerificationProgress | undefined>();
  protected readonly VerificationProgressStatus = VerificationProgressStatus;
  readonly isLoading = computed(() => this.progress() === undefined);
  readonly daysRemainingForVerification = computed(() => this.daysUntil(this.progress()?.maxDateForStatus));

  private daysUntil(deadline?: string): number | null {
    if (!deadline) {
      return null;
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineDate = new Date(deadline);
    const target = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}
