import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'fullLang'
})
export class FullLangPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
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
    this.translate.get('eportal_global_lang_de');
    this.translate.get('eportal_global_lang_fr');
    this.translate.get('eportal_global_lang_it');
    this.translate.get('eportal_global_lang_rm');
    this.translate.get('eportal_global_lang_en');
  }
}
