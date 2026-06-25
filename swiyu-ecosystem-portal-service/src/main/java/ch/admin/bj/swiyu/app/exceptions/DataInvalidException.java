package ch.admin.bj.swiyu.app.exceptions;

public class DataInvalidException extends BusinessException {

    public DataInvalidException(String message, BusinessErrorCode errorCode) {
        super(message, errorCode);
    }
}
