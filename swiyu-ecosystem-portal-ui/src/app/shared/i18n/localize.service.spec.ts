import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {LocalizeService} from './localize.service';

describe('LocalizeService', () => {
  let service: LocalizeService;
  let onLangChange: Subject<LangChangeEvent>;

  beforeEach(() => {
    onLangChange = new Subject<LangChangeEvent>();
    const translateServiceMock = {
      onLangChange,
      getCurrentLang: jest.fn().mockReturnValue('de')
    };

    TestBed.configureTestingModule({
      providers: [LocalizeService, {provide: TranslateService, useValue: translateServiceMock}]
    });

    service = TestBed.inject(LocalizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localize', () => {
    const map = {
      default: 'Default Name',
      de: 'Deutsch',
      'de-CH': 'Deutsch CH',
      fr: 'Français'
    };

    it('returns empty string when map is null or undefined', () => {
      expect(service.localize(() => null)()).toBe('');
      expect(service.localize(() => undefined)()).toBe('');
    });

    it('returns exact language match', () => {
      expect(service.localize(() => map)()).toBe('Deutsch');
    });

    it('falls back to base language when regional locale is active', () => {
      const mapWithBaseLang = {default: 'Default', de: 'Deutsch'};
      onLangChange.next({lang: 'de-CH', translations: {}} as LangChangeEvent);
      TestBed.flushEffects();

      expect(service.localize(() => mapWithBaseLang)()).toBe('Deutsch');
    });

    it('falls back to regional variant when exact language is missing', () => {
      const regionalMap = {default: 'Default', 'de-CH': 'Deutsch CH'};
      onLangChange.next({lang: 'de', translations: {}} as LangChangeEvent);
      TestBed.flushEffects();

      expect(service.localize(() => regionalMap)()).toBe('Deutsch CH');
    });

    it('falls back to default key when no language match exists', () => {
      const defaultOnlyMap = {default: 'Default Name'};
      onLangChange.next({lang: 'it', translations: {}} as LangChangeEvent);
      TestBed.flushEffects();

      expect(service.localize(() => defaultOnlyMap)()).toBe('Default Name');
    });

    it('returns empty string when no match and no default exists', () => {
      const partialMap = {de: 'Deutsch'};
      onLangChange.next({lang: 'fr', translations: {}} as LangChangeEvent);
      TestBed.flushEffects();

      expect(service.localize(() => partialMap)()).toBe('');
    });

    it('updates when language changes', () => {
      const localized = service.localize(() => map);
      expect(localized()).toBe('Deutsch');

      onLangChange.next({lang: 'fr', translations: {}} as LangChangeEvent);
      TestBed.flushEffects();

      expect(localized()).toBe('Français');
    });

    it('updates when map source changes', () => {
      const mapSignal = signal(map);
      const localized = service.localize(() => mapSignal());

      expect(localized()).toBe('Deutsch');

      mapSignal.set({...map, de: 'Updated Deutsch'});
      TestBed.flushEffects();

      expect(localized()).toBe('Updated Deutsch');
    });
  });
});
