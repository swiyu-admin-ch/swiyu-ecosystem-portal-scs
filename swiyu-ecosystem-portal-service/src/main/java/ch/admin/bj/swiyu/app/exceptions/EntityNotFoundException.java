package ch.admin.bj.swiyu.app.exceptions;

public class EntityNotFoundException extends BusinessException {

    public EntityNotFoundException(String message, BusinessErrorCode errorCode) {
        super(message, errorCode);
    }
}
