import {Clipboard} from '@angular/cdk/clipboard';
import {Component, inject, input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ObButtonDirective, ObNotificationService} from '@oblique/oblique';

@Component({
  selector: 'app-clipboard',
  imports: [MatIconButton, MatIcon, ObButtonDirective, TranslatePipe, MatTooltip],
  templateUrl: './clipboard.component.html',
  styleUrl: './clipboard.component.scss'
})
export class ClipboardComponent {
  label = input<string>();
  value = input.required<string>();

  private readonly notificationService = inject(ObNotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly clipboard = inject(Clipboard);

  constructor() {
    // Required for translate service auto collection of i18n keys
    this.translateService.get('app_site_did-details_notification_copied');
  }

  copyToClipboard(): void {
    const success = this.clipboard.copy(this.value());
    if (success) {
      this.notificationService.success('app_site_did-details_notification_copied');
    }
  }
}
