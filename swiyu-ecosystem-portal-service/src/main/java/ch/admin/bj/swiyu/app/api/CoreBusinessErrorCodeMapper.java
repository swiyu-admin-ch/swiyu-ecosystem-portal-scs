package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import ch.admin.bj.swiyu.client.business.internal.model.ApiErrorCode;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class CoreBusinessErrorCodeMapper {

    private CoreBusinessErrorCodeMapper() {}

    public static BusinessErrorCode fromCoreBusiness(ApiErrorCode coreBusinessCode) {
        if (coreBusinessCode == null) {
            return BusinessErrorCode.DATA_INVALID;
        }

        try {
            return BusinessErrorCode.valueOf(coreBusinessCode.name());
        } catch (IllegalArgumentException ex) {
            log.warn(
                "Core Business returned unsupported error code '{}', falling back to DATA_INVALID",
                coreBusinessCode
            );
            return BusinessErrorCode.DATA_INVALID;
        }
    }
}
