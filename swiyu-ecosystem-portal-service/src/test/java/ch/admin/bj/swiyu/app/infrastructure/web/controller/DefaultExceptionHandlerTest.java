package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ch.admin.bj.swiyu.app.api.ApiErrorDto;
import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.app.exceptions.BusinessException;
import ch.admin.bj.swiyu.client.business.internal.model.ApiError;
import ch.admin.bj.swiyu.client.business.internal.model.ApiErrorCode;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.TraceContext;
import io.micrometer.tracing.Tracer;
import java.io.IOException;
import org.apache.catalina.connector.ClientAbortException;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;

class DefaultExceptionHandlerTest {

    @Test
    void handleRestClientException_withBadRequestFromCore_logsOnlyDebugAndPropagatesApiError() {
        var tracer = mock(Tracer.class);
        var span = mock(Span.class);
        var traceContext = mock(TraceContext.class);
        when(tracer.currentSpan()).thenReturn(span);
        when(span.context()).thenReturn(traceContext);
        when(traceContext.traceId()).thenReturn("trace-123");

        var handler = new DefaultExceptionHandler(tracer);
        var logger = (Logger) LoggerFactory.getLogger(DefaultExceptionHandler.class);
        var appender = new ListAppender<ILoggingEvent>();
        appender.start();
        logger.addAppender(appender);

        var exception = mock(HttpClientErrorException.class);
        var apiError = new ApiError().errorCode(ApiErrorCode.DATA_INVALID).message("invalid payload");
        when(exception.getStatusCode()).thenReturn(HttpStatus.BAD_REQUEST);
        when(exception.getMessage()).thenReturn("Bad Request");
        when(exception.getResponseBodyAs(ApiError.class)).thenReturn(apiError);
        when(exception.getResponseBodyAsString()).thenReturn(
            "{\"errorCode\":\"DATA_INVALID\",\"message\":\"invalid payload\"}"
        );

        ResponseEntity<Object> response = handler.handleRestClientException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isInstanceOf(ApiErrorDto.class);
        var body = (ApiErrorDto) response.getBody();
        assertThat(body.getErrorCode()).isEqualTo(BusinessErrorCode.DATA_INVALID);
        assertThat(body.getMessage()).isEqualTo("invalid payload");
        assertThat(body.getTraceId()).isEqualTo("trace-123");
        assertThat(appender.list).noneMatch(event -> event.getLevel() == Level.ERROR);

        logger.detachAppender(appender);
    }

    @Test
    void handleClientAbortException_logsDebugAndNoError() {
        var tracer = mock(Tracer.class);
        var handler = new DefaultExceptionHandler(tracer);
        var logger = (Logger) LoggerFactory.getLogger(DefaultExceptionHandler.class);
        var originalLevel = logger.getLevel();
        logger.setLevel(Level.DEBUG);
        var appender = new ListAppender<ILoggingEvent>();
        appender.start();
        logger.addAppender(appender);

        handler.handleClientAbortException(new ClientAbortException(new IOException("Connection reset by peer")));

        assertThat(appender.list)
            .noneMatch(event -> event.getLevel() == Level.ERROR)
            .anyMatch(event -> event.getLevel() == Level.DEBUG && event.getMessage().contains("Client aborted"));

        logger.detachAppender(appender);
        logger.setLevel(originalLevel);
    }

    @Test
    void handleBusinessException_returnsBadRequestWithPortalErrorCode() {
        var tracer = mock(Tracer.class);
        var span = mock(Span.class);
        var traceContext = mock(TraceContext.class);
        when(tracer.currentSpan()).thenReturn(span);
        when(span.context()).thenReturn(traceContext);
        when(traceContext.traceId()).thenReturn("trace-123");

        var handler = new DefaultExceptionHandler(tracer);
        var businessException = new BusinessException("Entity is invalid", BusinessErrorCode.DATA_INVALID) {};

        var response = handler.handleBusinessException(businessException);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getErrorCode()).isEqualTo(BusinessErrorCode.DATA_INVALID);
        assertThat(response.getBody().getMessage()).isEqualTo("Entity is invalid");
        assertThat(response.getBody().getTraceId()).isEqualTo("trace-123");
    }
}
