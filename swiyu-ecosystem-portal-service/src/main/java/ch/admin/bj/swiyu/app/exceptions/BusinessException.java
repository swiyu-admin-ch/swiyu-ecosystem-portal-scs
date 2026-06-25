package ch.admin.bj.swiyu.app.exceptions;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

public abstract class BusinessException extends RuntimeException {

    @Getter
    private final List<String> additionalDetails;

    @Getter
    private final BusinessErrorCode errorCode;

    protected BusinessException(String message, BusinessErrorCode code) {
        super(message);
        this.errorCode = code;
        this.additionalDetails = new ArrayList<>();
    }

    protected BusinessException(String message, BusinessErrorCode code, Throwable cause) {
        super(message, cause);
        this.errorCode = code;
        this.additionalDetails = new ArrayList<>();
    }

    protected BusinessException(String message, BusinessErrorCode code, String additionalDetails, Throwable cause) {
        super(message, cause);
        this.errorCode = code;
        this.additionalDetails = new ArrayList<>();
        this.additionalDetails.add(additionalDetails);
    }

    protected BusinessException(
        String message,
        BusinessErrorCode code,
        List<String> additionalDetails,
        Throwable cause
    ) {
        super(message, cause);
        this.errorCode = code;
        this.additionalDetails = additionalDetails;
    }
}
