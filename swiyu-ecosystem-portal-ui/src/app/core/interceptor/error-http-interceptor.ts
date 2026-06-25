import {HttpContextToken, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ObNotificationService} from '@oblique/oblique';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {
  businessErrorTranslationKeys,
  defaultErrorTranslationKeys,
  httpErrorTranslationKeys,
  I18nNotification,
  isApiCall,
  isBusinessError
} from './interceptor-utils';

export const SUPPRESS_ERROR_ALERT_STATUSES = new HttpContextToken<ReadonlySet<number>>(() => new Set());

export const errorHttpInterceptor: HttpInterceptorFn = (originalRequest: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const translate = inject(TranslateService);
  const notificationService = inject(ObNotificationService);
  const request = enhanceHeaderForApiCalls(originalRequest);

  return next(request).pipe(
    catchError((errorResponse: HttpErrorResponse) => {
      if (!isApiCall(request.url)) {
        return throwError(() => errorResponse);
      }

      if (isBusinessError(errorResponse.error)) {
        notifyError(translate, notificationService, businessErrorTranslationKeys(errorResponse.error.errorCode!));
      } else if (isHttpErrorResponse(errorResponse)) {
        if (request.context.get(SUPPRESS_ERROR_ALERT_STATUSES).has(errorResponse.status)) {
          return throwError(() => errorResponse);
        }

        notifyError(translate, notificationService, httpErrorTranslationKeys(errorResponse.status));
      } else {
        notifyError(translate, notificationService, defaultErrorTranslationKeys);
      }

      return throwError(() => errorResponse);
    })
  );
};

function notifyError(
  translate: TranslateService,
  notificationService: ObNotificationService,
  i18n: I18nNotification
): void {
  const title = getTranslationWithFallback(translate, i18n.titleKey, defaultErrorTranslationKeys.titleKey);
  const message = getTranslationWithFallback(translate, i18n.messageKey, defaultErrorTranslationKeys.messageKey);
  notificationService.error(`${title}: ${message}`);
}

function getTranslationWithFallback(translate: TranslateService, key: string, fallbackKey: string): string {
  const translation = translate.instant(key);
  if (!translation || translation === key) {
    return translate.instant(fallbackKey);
  }
  return translation;
}

function isHttpErrorResponse(error: unknown): error is HttpErrorResponse {
  return !!error && typeof error === 'object' && 'status' in error;
}

function enhanceHeaderForApiCalls(request: HttpRequest<unknown>): HttpRequest<unknown> {
  if (!isApiCall(request.url)) {
    return request;
  }
  return request.clone({headers: request.headers.set('X-Requested-With', 'XMLHttpRequest')});
}
