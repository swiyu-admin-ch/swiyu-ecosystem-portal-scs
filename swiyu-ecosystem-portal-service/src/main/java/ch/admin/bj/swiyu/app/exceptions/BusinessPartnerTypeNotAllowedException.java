package ch.admin.bj.swiyu.app.exceptions;

import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;

public class BusinessPartnerTypeNotAllowedException extends BusinessException {

    public BusinessPartnerTypeNotAllowedException(BusinessPartnerType invalidType) {
        super(
            "Partner registration for type '%s' is currently not allowed".formatted(invalidType),
            BusinessErrorCode.DATA_INVALID
        );
    }
}
