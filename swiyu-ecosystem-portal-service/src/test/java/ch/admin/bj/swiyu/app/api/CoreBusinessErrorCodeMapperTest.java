package ch.admin.bj.swiyu.app.api;

import static org.assertj.core.api.Assertions.assertThat;

import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.client.business.internal.model.ApiErrorCode;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CoreBusinessErrorCodeMapperTest {

    @Test
    void fromCoreBusiness_mapsAllSupportedBusinessCodes() {
        var supportedMappings = Map.of(
            ApiErrorCode.DATA_INVALID,
            BusinessErrorCode.DATA_INVALID,
            ApiErrorCode.DATA_INVALID_VIRUS_DETECTED,
            BusinessErrorCode.DATA_INVALID_VIRUS_DETECTED,
            ApiErrorCode.RESOURCE_NOT_FOUND,
            BusinessErrorCode.RESOURCE_NOT_FOUND,
            ApiErrorCode.RESOURCE_FORBIDDEN,
            BusinessErrorCode.RESOURCE_FORBIDDEN,
            ApiErrorCode.BUSINESS_DATA_INTEGRITY_VIOLATION,
            BusinessErrorCode.BUSINESS_DATA_INTEGRITY_VIOLATION,
            ApiErrorCode.OBJECT_COUNT_LIMIT_REACHED,
            BusinessErrorCode.OBJECT_COUNT_LIMIT_REACHED,
            ApiErrorCode.INVALID_PAGINATION,
            BusinessErrorCode.INVALID_PAGINATION,
            ApiErrorCode.IDENTIFIER_VALIDATION_FAILED,
            BusinessErrorCode.IDENTIFIER_VALIDATION_FAILED,
            ApiErrorCode.MAX_SIZE_EXCEEDED,
            BusinessErrorCode.MAX_SIZE_EXCEEDED,
            ApiErrorCode.DOCUMENT_NOT_FOUND,
            BusinessErrorCode.DOCUMENT_NOT_FOUND
        );

        supportedMappings.forEach((cbsCode, expectedPortalCode) ->
            assertThat(CoreBusinessErrorCodeMapper.fromCoreBusiness(cbsCode)).isEqualTo(expectedPortalCode)
        );
    }

    @Test
    void fromCoreBusiness_fallsBackToDataInvalidForNull() {
        assertThat(CoreBusinessErrorCodeMapper.fromCoreBusiness(null)).isEqualTo(BusinessErrorCode.DATA_INVALID);
    }

    @Test
    void fromCoreBusiness_fallsBackToDataInvalidForUnsupportedCoreBusinessCode() {
        assertThat(CoreBusinessErrorCodeMapper.fromCoreBusiness(ApiErrorCode.ACTION_FORBIDDEN)).isEqualTo(
            BusinessErrorCode.DATA_INVALID
        );
    }
}
