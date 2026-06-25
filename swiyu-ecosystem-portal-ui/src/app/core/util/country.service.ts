import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  readonly countries: string[] = ['CH'];

  getCountryTranslationKey(countryCode: string): string {
    return `eportal_global_country_${countryCode}`;
  }
}
