import {HttpContext, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideTranslateService, TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObNotificationService} from '@oblique/oblique';
import {Observable, throwError} from 'rxjs';
import * as enTranslations from '../../../assets/i18n/en.json';
import {ApiError, ApiErrorCode} from '../../api/generated';
import {errorHttpInterceptor, SUPPRESS_ERROR_ALERT_STATUSES} from './error-http-interceptor';

describe('ErrorHttpInterceptor', () => {
  let notificationService: {error: jest.Mock};

  beforeEach(() => {
    notificationService = {error: jest.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        {provide: ObNotificationService, useValue: notificationService as unknown as ObNotificationService}
      ],
      imports: [TranslateModule.forRoot()]
    });
    const translate = TestBed.inject(TranslateService);
    translate.instant = key => (enTranslations as Record<string, string>)[key as string];
  });

  it('raises notification on known business error code', done => {
    executeInterceptor(apiHttpRequest(), () =>
      throwError(() => businessHttpErrorResponse(ApiErrorCode.DataInvalid))
    ).subscribe({
      error: () => {
        expect(notificationService.error).toHaveBeenCalledWith('Invalid data: The submitted data is invalid.');
        done();
      }
    });
  });

  it('falls back to http status mapping for non-business error', done => {
    executeInterceptor(apiHttpRequest(), () => throwError(() => ({status: 404, error: {message: 'x'}}))).subscribe({
      error: () => {
        expect(notificationService.error).toHaveBeenCalledWith('Not found: The requested resource was not found.');
        done();
      }
    });
  });

  it('suppresses notification when response status is configured in request context', done => {
    executeInterceptor(
      apiHttpRequest({
        context: new HttpContext().set(SUPPRESS_ERROR_ALERT_STATUSES, new Set([404]))
      }),
      () => throwError(() => ({status: 404, error: {message: 'x'}}))
    ).subscribe({
      error: () => {
        expect(notificationService.error).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('does not suppress notification for statuses not configured in request context', done => {
    executeInterceptor(
      apiHttpRequest({
        context: new HttpContext().set(SUPPRESS_ERROR_ALERT_STATUSES, new Set([409]))
      }),
      () => throwError(() => ({status: 404, error: {message: 'x'}}))
    ).subscribe({
      error: () => {
        expect(notificationService.error).toHaveBeenCalledWith('Not found: The requested resource was not found.');
        done();
      }
    });
  });

  it('falls back to default mapping for unknown error type', done => {
    executeInterceptor(apiHttpRequest(), () => throwError(() => ({foo: 'bar'}))).subscribe({
      error: () => {
        expect(notificationService.error).toHaveBeenCalledWith('Error: Something went wrong. Please try again.');
        done();
      }
    });
  });

  it('does not notify for non-api calls', done => {
    executeInterceptor(nonApiHttpRequest(), () => throwError(() => ({status: 404, error: {message: 'x'}}))).subscribe({
      error: () => {
        expect(notificationService.error).not.toHaveBeenCalled();
        done();
      }
    });
  });
});

function apiHttpRequest(init?: {context?: HttpContext}): HttpRequest<unknown> {
  return new HttpRequest('GET', '/api/v1/example', undefined, {context: init?.context});
}

function nonApiHttpRequest(): HttpRequest<unknown> {
  return new HttpRequest('GET', '/assets/example.json');
}

function executeInterceptor(request: HttpRequest<unknown>, handler: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return TestBed.runInInjectionContext(() => errorHttpInterceptor(request, handler));
}

function businessHttpErrorResponse(errorCode: ApiErrorCode): HttpErrorResponse {
  const businessError: ApiError = {
    errorCode,
    message: 'Business error'
  };
  return {
    error: businessError,
    status: 400,
    url: '/api/v1/example'
  } as HttpErrorResponse;
}
