import {TestBed} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {I18nKeyDisplayService} from './i18n-key-display.service';

describe('I18nKeyDisplayService', () => {
  let service: I18nKeyDisplayService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let translateService: any;

  beforeEach(() => {
    translateService = {
      setTranslation: jest.fn(),
      setFallbackLang: jest.fn().mockReturnValue(of({})),
      use: jest.fn().mockReturnValue(of({})),
      getCurrentLang: jest.fn().mockReturnValue('de'),
      getFallbackLang: jest.fn().mockReturnValue('de'),
      getLangs: jest.fn().mockReturnValue(['de', 'fr', 'it', 'en'])
    };

    TestBed.configureTestingModule({
      providers: [I18nKeyDisplayService, {provide: TranslateService, useValue: translateService}]
    });

    service = TestBed.inject(I18nKeyDisplayService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('isEnabled', () => {
    it('should return false when sessionStorage flag is not set', () => {
      expect(service.isEnabled).toBe(false);
    });

    it('should return true when sessionStorage flag is set to "true"', () => {
      sessionStorage.setItem('show_i18n_keys', 'true');
      expect(service.isEnabled).toBe(true);
    });
  });

  describe('toggle', () => {
    describe('when mode is disabled', () => {
      beforeEach(() => {
        service.toggle();
      });

      it('should set the sessionStorage flag', () => {
        expect(sessionStorage.getItem('show_i18n_keys')).toBe('true');
      });

      it('should register empty translations for the fake "keys" language', () => {
        expect(translateService.setTranslation).toHaveBeenCalledWith('keys', {});
      });

      it('should set "keys" as the fallback language to prevent fallback to real translations', () => {
        expect(translateService.setFallbackLang).toHaveBeenCalledWith('keys');
      });

      it('should switch to the "keys" language', () => {
        expect(translateService.use).toHaveBeenCalledWith('keys');
      });

      it('should save the previous language to sessionStorage', () => {
        expect(sessionStorage.getItem('show_i18n_keys_prev_lang')).toBe('de');
      });

      it('should save the previous fallback language to sessionStorage', () => {
        expect(sessionStorage.getItem('show_i18n_keys_prev_fallback')).toBe('de');
      });
    });

    describe('when mode is enabled', () => {
      beforeEach(() => {
        sessionStorage.setItem('show_i18n_keys', 'true');
        sessionStorage.setItem('show_i18n_keys_prev_lang', 'fr');
        sessionStorage.setItem('show_i18n_keys_prev_fallback', 'de');
        service.toggle();
      });

      it('should clear the sessionStorage flag', () => {
        expect(sessionStorage.getItem('show_i18n_keys')).toBeNull();
      });

      it('should restore the previous fallback language', () => {
        expect(translateService.setFallbackLang).toHaveBeenCalledWith('de');
      });

      it('should restore the previous language', () => {
        expect(translateService.use).toHaveBeenCalledWith('fr');
      });

      it('should remove the saved prev-lang keys from sessionStorage', () => {
        expect(sessionStorage.getItem('show_i18n_keys_prev_lang')).toBeNull();
        expect(sessionStorage.getItem('show_i18n_keys_prev_fallback')).toBeNull();
      });
    });

    describe('when disabling without previously saved language', () => {
      beforeEach(() => {
        sessionStorage.setItem('show_i18n_keys', 'true');
        service.toggle();
      });

      it('should fall back to the first available language', () => {
        expect(translateService.use).toHaveBeenCalledWith('de');
      });
    });
  });
});
