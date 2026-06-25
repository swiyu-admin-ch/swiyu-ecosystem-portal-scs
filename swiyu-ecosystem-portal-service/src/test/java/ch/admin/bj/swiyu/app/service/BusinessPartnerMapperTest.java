package ch.admin.bj.swiyu.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ch.admin.bj.swiyu.app.api.BusinessPartnerDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerListItemDto;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartner;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerListItem;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;

class BusinessPartnerMapperTest {

    private static BusinessPartner minimalBusinessPartner() {
        var bp = new BusinessPartner();
        bp.setType(BusinessPartnerType.BUSINESS);
        bp.setPayedForTrustVerification(false);
        bp.setPayedForDIDSlots(0);
        return bp;
    }

    private static BusinessPartnerListItem minimalBusinessPartnerListItem() {
        var bp = new BusinessPartnerListItem();
        bp.setType(BusinessPartnerType.BUSINESS);
        bp.setPayedForTrustVerification(false);
        bp.setPayedForDIDSlots(0);
        return bp;
    }

    @Test
    void toBusinessPartnerDto_whenMaxDateIsNull_thenDaysRemainingIsNull() {
        var bp = minimalBusinessPartner();
        bp.setMaxDateForTrustVerificationStatus(null);

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp);

        assertNull(dto.daysRemainingForTrustVerificationStatus());
    }

    @Test
    void toBusinessPartnerDto_whenMaxDateIs30DaysFromNow_thenDaysRemainingIs30() {
        var bp = minimalBusinessPartner();
        bp.setMaxDateForTrustVerificationStatus(Instant.now().plus(30, ChronoUnit.DAYS));

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp);

        assertEquals(30L, dto.daysRemainingForTrustVerificationStatus());
    }

    @Test
    void toBusinessPartnerDto_whenMaxDateIsInThePast_thenDaysRemainingIsNegative() {
        var bp = minimalBusinessPartner();
        bp.setMaxDateForTrustVerificationStatus(Instant.now().minus(5, ChronoUnit.DAYS));

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp);

        assertEquals(-5L, dto.daysRemainingForTrustVerificationStatus());
    }

    @Test
    void toBusinessPartnerListItemDto_whenMaxDateIsNull_thenDaysRemainingIsNull() {
        var bp = minimalBusinessPartnerListItem();
        bp.setMaxDateForTrustVerificationStatus(null);

        BusinessPartnerListItemDto dto = BusinessPartnerMapper.toBusinessPartnerListItemDto(bp);

        assertNull(dto.daysRemainingForTrustVerificationStatus());
    }

    @Test
    void toBusinessPartnerListItemDto_whenMaxDateIs30DaysFromNow_thenDaysRemainingIs30() {
        var bp = minimalBusinessPartnerListItem();
        bp.setMaxDateForTrustVerificationStatus(Instant.now().plus(30, ChronoUnit.DAYS));

        BusinessPartnerListItemDto dto = BusinessPartnerMapper.toBusinessPartnerListItemDto(bp);

        assertEquals(30L, dto.daysRemainingForTrustVerificationStatus());
    }

    @Test
    void toBusinessPartnerListItemDto_whenMaxDateIsInThePast_thenDaysRemainingIsNegative() {
        var bp = minimalBusinessPartnerListItem();
        bp.setMaxDateForTrustVerificationStatus(Instant.now().minus(5, ChronoUnit.DAYS));

        BusinessPartnerListItemDto dto = BusinessPartnerMapper.toBusinessPartnerListItemDto(bp);

        assertEquals(-5L, dto.daysRemainingForTrustVerificationStatus());
    }
}
