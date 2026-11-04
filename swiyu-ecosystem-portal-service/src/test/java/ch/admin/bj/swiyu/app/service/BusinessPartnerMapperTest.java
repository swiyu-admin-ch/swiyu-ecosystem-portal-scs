package ch.admin.bj.swiyu.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ch.admin.bj.swiyu.app.api.BusinessPartnerDto;
import ch.admin.bj.swiyu.app.api.BusinessPartnerListItemDto;
import ch.admin.bj.swiyu.app.api.LanguageDto;
import ch.admin.bj.swiyu.app.api.VerificationProgressStatusDto;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartner;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerListItem;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import ch.admin.bj.swiyu.client.business.internal.model.Contact;
import ch.admin.bj.swiyu.client.business.internal.model.IdentityVerificationProgress;
import ch.admin.bj.swiyu.client.business.internal.model.IdentityVerificationProgressStatus;
import ch.admin.bj.swiyu.client.business.internal.model.Language;
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
    void toBusinessPartnerDto_whenVerificationProgressMaxDateIsNull_thenVerificationDaysRemainingIsNull() {
        var bp = minimalBusinessPartner();

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp, null);

        assertNull(dto.verificationProgressMaxDate());
        assertNull(dto.daysRemainingForVerification());
    }

    @Test
    void toBusinessPartnerDto_whenVerificationProgressMaxDateIs30DaysFromNow_thenVerificationDaysRemainingIs30() {
        var bp = minimalBusinessPartner();
        var maxDate = Instant.now().plus(30, ChronoUnit.DAYS);

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp, maxDate);

        assertEquals(maxDate, dto.verificationProgressMaxDate());
        assertEquals(30L, dto.daysRemainingForVerification());
    }

    @Test
    void toBusinessPartnerDto_whenContactIsSet_thenContactIsMappedFromNestedContact() {
        var bp = minimalBusinessPartner();
        var contact = new Contact();
        contact.setFirstName("Anna");
        contact.setLastName("Muster");
        contact.setEmail("anna.muster@example.com");
        contact.setPhone("+41 79 123 45 67");
        contact.setCorrespondingLanguage(Language.DE);
        bp.setContact(contact);

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp);

        assertEquals("Anna", dto.contact().firstName());
        assertEquals("Muster", dto.contact().lastName());
        assertEquals("anna.muster@example.com", dto.contact().email());
        assertEquals("+41 79 123 45 67", dto.contact().phone());
        assertEquals(LanguageDto.DE, dto.contact().correspondingLanguage());
    }

    @Test
    void toBusinessPartnerDto_whenContactIsNull_thenContactIsNull() {
        var bp = minimalBusinessPartner();

        BusinessPartnerDto dto = BusinessPartnerMapper.toBusinessPartnerDto(bp);

        assertNull(dto.contact());
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

    @Test
    void toBusinessPartnerListItemDto_whenVerificationProgressMaxDateIsNull_thenVerificationDaysRemainingIsNull() {
        var bp = minimalBusinessPartnerListItem();

        BusinessPartnerListItemDto dto = BusinessPartnerMapper.toBusinessPartnerListItemDto(bp, null);

        assertNull(dto.verificationProgressMaxDate());
        assertNull(dto.daysRemainingForVerification());
    }

    @Test
    void toBusinessPartnerListItemDto_whenVerificationProgressMaxDateIs30DaysFromNow_thenVerificationDaysRemainingIs30() {
        var bp = minimalBusinessPartnerListItem();
        var maxDate = Instant.now().plus(30, ChronoUnit.DAYS);

        BusinessPartnerListItemDto dto = BusinessPartnerMapper.toBusinessPartnerListItemDto(bp, maxDate);

        assertEquals(maxDate, dto.verificationProgressMaxDate());
        assertEquals(30L, dto.daysRemainingForVerification());
    }

    @Test
    void toVerificationProgressDto_whenProgressNull_thenReturnsNull() {
        assertNull(BusinessPartnerMapper.toVerificationProgressDto(null));
    }

    @Test
    void toVerificationProgressDto_mapsStatusAndMaxDate() {
        var maxDate = Instant.now().plus(30, ChronoUnit.DAYS);
        var progress = new IdentityVerificationProgress(
            IdentityVerificationProgressStatus.RE_VERIFICATION_REQUIRED,
            maxDate
        );

        var dto = BusinessPartnerMapper.toVerificationProgressDto(progress);

        assertEquals(VerificationProgressStatusDto.RE_VERIFICATION_REQUIRED, dto.status());
        assertEquals(maxDate, dto.maxDateForStatus());
    }
}
