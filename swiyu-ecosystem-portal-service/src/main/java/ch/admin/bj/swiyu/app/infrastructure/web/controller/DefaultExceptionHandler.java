package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import ch.admin.bj.swiyu.app.api.ApiErrorDto;
import ch.admin.bj.swiyu.app.api.CoreBusinessErrorCodeMapper;
import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.app.exceptions.BusinessException;
import ch.admin.bj.swiyu.client.business.internal.model.ApiError;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.ClientAbortException;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RestControllerAdvice
@AllArgsConstructor
public class DefaultExceptionHandler extends ResponseEntityExceptionHandler {

    private final Tracer tracer;

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex) {
        log.debug("User requested forbidden data.", ex);
        return new ResponseEntity<>("Access Denied", HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(OpenApiResourceNotFoundException.class)
    public ResponseEntity<Object> handleOpenApiResourceNotFoundException(
        OpenApiResourceNotFoundException ex,
        WebRequest request
    ) {
        return new ResponseEntity<>("Resource not found", HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Object> handleRestClientException(HttpClientErrorException e) {
        log.debug("Error when calling external api {}", e.getMessage());
        if (e.getStatusCode().is5xxServerError()) {
            log.error("Error during external api call {}", e.getMessage());
        }

        try {
            var cbsApiError = e.getResponseBodyAs(ApiError.class);
            // In some cases getResponseBodyAs returned null even though this should not happen
            //noinspection ReassignedVariable,ConstantValue
            ApiErrorDto apiError;
            if (cbsApiError == null) {
                apiError = ApiErrorDto.builder()
                    .errorCode(mapStatusToErrorCode(e.getStatusCode()))
                    .message(e.getMessage())
                    .build();
            } else {
                apiError = ApiErrorDto.builder()
                    .errorCode(CoreBusinessErrorCodeMapper.fromCoreBusiness(cbsApiError.getErrorCode()))
                    .message(cbsApiError.getMessage())
                    .additionalDetails(cbsApiError.getAdditionalDetails())
                    .build();
            }
            apiError.setTraceId(currentTraceId());
            return new ResponseEntity<>(apiError, e.getStatusCode());
        } catch (RestClientException ex) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorDto> handleBusinessException(BusinessException exception) {
        return new ResponseEntity<>(
            ApiErrorDto.builder()
                .errorCode(exception.getErrorCode())
                .message(exception.getMessage())
                .additionalDetails(exception.getAdditionalDetails())
                .traceId(currentTraceId())
                .build(),
            HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(ClientAbortException.class)
    public void handleClientAbortException(ClientAbortException ex) {
        log.debug("Client aborted the connection.", ex);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ApiErrorDto> handleUnexpectedErrors(final Exception exception, HttpServletRequest r) {
        log.error("Detected unhandled exception for url {}", r.getRequestURL(), exception);
        return new ResponseEntity<>(
            ApiErrorDto.builder().message("An unexpected error occurred").traceId(currentTraceId()).build(),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    private BusinessErrorCode mapStatusToErrorCode(HttpStatusCode statusCode) {
        return switch (statusCode) {
            case HttpStatus.NOT_FOUND -> BusinessErrorCode.RESOURCE_NOT_FOUND;
            case HttpStatus.FORBIDDEN -> BusinessErrorCode.RESOURCE_FORBIDDEN;
            default -> BusinessErrorCode.DATA_INVALID;
        };
    }

    private String currentTraceId() {
        var currentSpan = this.tracer.currentSpan();
        return currentSpan.context().traceId();
    }
}
