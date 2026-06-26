import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'fullLang'
})
export class FullLangPipe implements PipeTransform {
  private readonly lang = inject(TranslateService);
  constructor() {
    this.translateSetup();
  }

  transform(value: unknown): string {
    if (typeof value !== 'string' || value.trim() === '') {
      return '';
    }

    const lang = value.includes('-') ? value.split('-')[0] : value;

    return `eportal_global_lang_${lang.trim().toLowerCase()}`;
  }

  private translateSetup(): void {
    this.lang.instant('eportal_global_lang_de');
    this.lang.instant('eportal_global_lang_fr');
    this.lang.instant('eportal_global_lang_it');
    this.lang.instant('eportal_global_lang_rm');
    this.lang.instant('eportal_global_lang_en');
  }
}
