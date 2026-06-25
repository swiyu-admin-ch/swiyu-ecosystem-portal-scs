import {Component, computed, input} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {BusinessPartner, BusinessPartnerListItem, BusinessPartnerTrustStatus} from '../../api/generated';

@Component({
  selector: 'app-business-partner-trust-chip',
  imports: [MatChipsModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './business-partner-trust-chip.component.html',
  styleUrl: './business-partner-trust-chip.component.scss'
})
export class BusinessPartnerTrustChipComponent {
  readonly businessPartner = input.required<BusinessPartnerListItem | BusinessPartner | undefined>();
  readonly daysRemainingForTrustVerificationStatus = computed(
    () => this.businessPartner()?.daysRemainingForTrustVerificationStatus ?? undefined
  );
  protected readonly BusinessPartnerTrustStatus = BusinessPartnerTrustStatus;
}
