import {DOCUMENT} from '@angular/common';
import {inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

type PrimitiveParam = string | number | boolean;

const buildMailtoHandoverLink = (subject: string, body: string): string =>
  `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export interface MailtoTemplateConfig {
  subjectKey: string;
  bodyKey: string;
  extraBodyParams?: Record<string, PrimitiveParam>;
}

@Injectable({providedIn: 'root'})
export class MailtoTemplateService {
  private readonly translateService = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  buildHandoverMailtoLink(config: MailtoTemplateConfig): string {
    const subject = this.translateService.instant(config.subjectKey);
    const body = this.translateService.instant(config.bodyKey, {
      handoverUrl: this.document.location.href,
      servicePortalUrl: this.document.location.origin,
      ...config.extraBodyParams
    });
    return buildMailtoHandoverLink(subject, body);
  }
}
