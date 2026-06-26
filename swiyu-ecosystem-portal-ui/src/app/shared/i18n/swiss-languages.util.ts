import {TrustOnboardingSubmissionRequest} from '../../api/generated';
import CorrespondingLanguageEnum = TrustOnboardingSubmissionRequest.CorrespondingLanguageEnum;

export const SWISS_LANGUAGES = [
  CorrespondingLanguageEnum.De,
  CorrespondingLanguageEnum.Fr,
  CorrespondingLanguageEnum.It,
  CorrespondingLanguageEnum.En,
  CorrespondingLanguageEnum.Rm
] as const;

export type SwissLanguage = (typeof SWISS_LANGUAGES)[number];

export function toSwissLocale(lang: SwissLanguage): string {
  return `${lang.toLowerCase()}-CH`;
}

export const SWISS_LANGUAGE_TAGS = SWISS_LANGUAGES.map(toSwissLocale);
