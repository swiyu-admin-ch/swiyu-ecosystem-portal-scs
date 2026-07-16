package ch.admin.bj.swiyu.app.domain;

import ch.admin.bj.swiyu.app.common.config.FunctionalityProperties;
import ch.admin.bj.swiyu.app.exceptions.BusinessPartnerTypeNotAllowedException;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BusinessPartnerValidator {

    private final FunctionalityProperties functionalityProperties;

    public void validateBusinessPartnerTypeOnboardingIsAllowed(BusinessPartnerType type)
        throws BusinessPartnerTypeNotAllowedException {
        var allowed =
            switch (type) {
                case BUSINESS -> functionalityProperties.allowPartnerBaseOnboardingBusinessEnabled();
                case INDIVIDUAL -> functionalityProperties.allowPartnerBaseOnboardingIndividualEnabled();
                case GOVERNMENTAL_INSTITUTION -> functionalityProperties.allowPartnerBaseOnboardingGovernmentalEnabled();
                case UNKNOWN -> false;
                case null -> false;
            };
        if (!allowed) {
            throw new BusinessPartnerTypeNotAllowedException(type);
        }
    }
}
