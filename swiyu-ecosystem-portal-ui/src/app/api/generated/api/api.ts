export * from './app-config-api';
export * from './business-partner-api';
export * from './identifier-api';
export * from './registration-api';
export * from './trust-onboarding-api';
export * from './trust-onboarding-documents-api';
export * from './user-profile-api';
import {AppConfigApi} from './app-config-api';
import {BusinessPartnerApi} from './business-partner-api';
import {IdentifierApi} from './identifier-api';
import {RegistrationApi} from './registration-api';
import {TrustOnboardingApi} from './trust-onboarding-api';
import {TrustOnboardingDocumentsApi} from './trust-onboarding-documents-api';
import {UserProfileApi} from './user-profile-api';
export const APIS = [
  AppConfigApi,
  BusinessPartnerApi,
  IdentifierApi,
  RegistrationApi,
  TrustOnboardingApi,
  TrustOnboardingDocumentsApi,
  UserProfileApi
];
