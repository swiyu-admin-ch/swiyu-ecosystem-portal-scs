import {TrustOnboardingSubmission} from '../../api/generated';
import CorrespondingLanguageEnum = TrustOnboardingSubmission.CorrespondingLanguageEnum;

/** The correspondence languages a contact person can be written to in. */
export const SWISS_LANGUAGES = [
  CorrespondingLanguageEnum.De,
  CorrespondingLanguageEnum.Fr,
  CorrespondingLanguageEnum.It,
  CorrespondingLanguageEnum.En,
  CorrespondingLanguageEnum.Rm
] as const;
