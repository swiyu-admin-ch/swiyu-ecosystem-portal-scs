import {_} from '@ngx-translate/core';
import {ApiError, ApiErrorCode} from '../../api/generated';

export interface I18nNotification {
  titleKey: string;
  messageKey: string;
}

export const BUSINESS_ERROR_CODES: ApiErrorCode[] = [
  ApiErrorCode.DataInvalid,
  ApiErrorCode.DataInvalidVirusDetected,
  ApiErrorCode.ResourceNotFound,
  ApiErrorCode.ResourceForbidden,
  ApiErrorCode.BusinessDataIntegrityViolation,
  ApiErrorCode.ObjectCountLimitReached,
  ApiErrorCode.InvalidPagination,
  ApiErrorCode.IdentifierValidationFailed,
  ApiErrorCode.MaxSizeExceeded,
  ApiErrorCode.DocumentNotFound
];
const businessErrorCodeSet = new Set<ApiErrorCode>(BUSINESS_ERROR_CODES);

export const HTTP_ERROR_STATUSES = [400, 403, 404, 500, 501, 502, 503, 504] as const;

// All translation keys must be statically available so they don't get pruned by ngx-translate-extract.
_('app_error_default_title');
_('app_error_default_message');
_('app_error_business_DATA_INVALID_title');
_('app_error_business_DATA_INVALID_message');
_('app_error_business_DATA_INVALID_VIRUS_DETECTED_title');
_('app_error_business_DATA_INVALID_VIRUS_DETECTED_message');
_('app_error_business_RESOURCE_NOT_FOUND_title');
_('app_error_business_RESOURCE_NOT_FOUND_message');
_('app_error_business_RESOURCE_FORBIDDEN_title');
_('app_error_business_RESOURCE_FORBIDDEN_message');
_('app_error_business_BUSINESS_DATA_INTEGRITY_VIOLATION_title');
_('app_error_business_BUSINESS_DATA_INTEGRITY_VIOLATION_message');
_('app_error_business_OBJECT_COUNT_LIMIT_REACHED_title');
_('app_error_business_OBJECT_COUNT_LIMIT_REACHED_message');
_('app_error_business_INVALID_PAGINATION_title');
_('app_error_business_INVALID_PAGINATION_message');
_('app_error_business_IDENTIFIER_VALIDATION_FAILED_title');
_('app_error_business_IDENTIFIER_VALIDATION_FAILED_message');
_('app_error_business_MAX_SIZE_EXCEEDED_title');
_('app_error_business_MAX_SIZE_EXCEEDED_message');
_('app_error_business_DOCUMENT_NOT_FOUND_title');
_('app_error_business_DOCUMENT_NOT_FOUND_message');
_('app_error_http_400_title');
_('app_error_http_400_message');
_('app_error_http_403_title');
_('app_error_http_403_message');
_('app_error_http_404_title');
_('app_error_http_404_message');
_('app_error_http_500_title');
_('app_error_http_500_message');
_('app_error_http_501_title');
_('app_error_http_501_message');
_('app_error_http_502_title');
_('app_error_http_502_message');
_('app_error_http_503_title');
_('app_error_http_503_message');
_('app_error_http_504_title');
_('app_error_http_504_message');

export const defaultErrorTranslationKeys: I18nNotification = {
  titleKey: 'app_error_default_title',
  messageKey: 'app_error_default_message'
};

export function businessErrorTranslationKeys(errorCode: string): I18nNotification {
  return {
    titleKey: `app_error_business_${errorCode}_title`,
    messageKey: `app_error_business_${errorCode}_message`
  };
}

export function httpErrorTranslationKeys(status: number): I18nNotification {
  return {
    titleKey: `app_error_http_${status}_title`,
    messageKey: `app_error_http_${status}_message`
  };
}

export function isApiCall(url: string): boolean {
  return url.startsWith('/api') || url.includes('/api/');
}

export function isBusinessError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const candidate = error as ApiError;
  return !!candidate.errorCode && businessErrorCodeSet.has(candidate.errorCode);
}
