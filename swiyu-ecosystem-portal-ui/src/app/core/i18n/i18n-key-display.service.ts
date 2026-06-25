import {inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

const SESSION_KEY = 'show_i18n_keys';
const PREV_LANG_KEY = 'show_i18n_keys_prev_lang';
const PREV_FALLBACK_KEY = 'show_i18n_keys_prev_fallback';
const KEYS_LANG = 'keys';

/**
 * Developer utility: toggles a mode where all translation keys are displayed instead of their translated values.
 * Useful for the design team to identify mismatches between i18n keys and translated strings across languages.
 *
 * Toggle via keyboard shortcut Ctrl+Shift+K, or programmatically via the console:
 *   sessionStorage.setItem('show_i18n_keys', 'true'); location.reload();
 */
@Injectable({providedIn: 'root'})
export class I18nKeyDisplayService {
  private readonly translate = inject(TranslateService);

  get isEnabled(): boolean {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  private enable(): void {
    sessionStorage.setItem(SESSION_KEY, 'true');
    sessionStorage.setItem(PREV_LANG_KEY, this.translate.getCurrentLang());
    sessionStorage.setItem(PREV_FALLBACK_KEY, this.translate.getFallbackLang() ?? '');

    // Register an empty language so the HTTP loader is never called for it
    this.translate.setTranslation(KEYS_LANG, {});

    // Set fake lang as fallback too: if only currentLang were 'keys', ngx-translate would
    // fall through to the real fallback language (e.g. 'de') for every missing key.
    // When fallbackLang === currentLang the fallback check is skipped, so
    // DefaultMissingTranslationHandler.handle() fires and returns the key string.
    this.translate.setFallbackLang(KEYS_LANG);

    this.translate.use(KEYS_LANG);
  }

  private disable(): void {
    sessionStorage.removeItem(SESSION_KEY);

    const prevLang = sessionStorage.getItem(PREV_LANG_KEY) ?? this.translate.getLangs()[0];
    const prevFallback = sessionStorage.getItem(PREV_FALLBACK_KEY) ?? prevLang;

    sessionStorage.removeItem(PREV_LANG_KEY);
    sessionStorage.removeItem(PREV_FALLBACK_KEY);

    this.translate.setFallbackLang(prevFallback);
    this.translate.use(prevLang);
  }
}
