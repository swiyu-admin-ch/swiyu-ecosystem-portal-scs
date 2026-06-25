package ch.admin.bj.swiyu.app.exceptions;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ApiErrorCode", enumAsRef = true)
public enum BusinessErrorCode {
    DATA_INVALID,
    DATA_INVALID_VIRUS_DETECTED,
    RESOURCE_NOT_FOUND,
    RESOURCE_FORBIDDEN,
    BUSINESS_DATA_INTEGRITY_VIOLATION,
    OBJECT_COUNT_LIMIT_REACHED,
    INVALID_PAGINATION,
    IDENTIFIER_VALIDATION_FAILED,
    MAX_SIZE_EXCEEDED,
    DOCUMENT_NOT_FOUND,
}
