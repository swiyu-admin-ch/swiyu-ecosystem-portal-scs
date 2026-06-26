package ch.admin.bj.swiyu.app.test;

import ch.admin.bj.swiyu.client.business.internal.model.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class TrustOnboardingTestData {

    public static final UUID TEST_PARTNER = UUID.fromString("9f425029-9775-4984-99ba-bacc60069502");
    public static final UUID TEST_SUBMISSION_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    public static Map<String, String> defaultEntityNameMap() {
        var map = new LinkedHashMap<String, String>();
        map.put("default", "Name de");
        map.put("de-CH", "Name de");
        map.put("en-CH", "Name en");
        map.put("it-CH", "Name it");
        map.put("fr-CH", "Name fr");
        map.put("rm-CH", "Name rm");
        return Map.copyOf(map);
    }

    public static MultiLanguageText defaultEntityName() {
        var entityName = new MultiLanguageText();
        entityName.de("Name de").en("Name en").it("Name it").fr("Name fr").rm("Name rm");
        return entityName;
    }

    public static Address defaultAddress() {
        var address = new Address();
        address.city("City").country("Country").street("Street").postalCode("8000");
        return address;
    }

    public static Contact defaultContact() {
        var contact = new Contact();
        contact
            .address(defaultAddress())
            .firstName("First Name")
            .lastName("Last Name")
            .email("Email")
            .phone("0123456789");
        return contact;
    }

    public static TrustOnboardingSubmissionRequest defaultSubmissionRequest() {
        var request = new TrustOnboardingSubmissionRequest();
        request
            .partnerId(TEST_PARTNER)
            .contactPerson(defaultContact())
            .correspondingLanguage(Language.DE)
            .entityName(defaultEntityNameMap())
            .entityAddress(defaultAddress())
            .entityEmail("Email")
            .dids(List.of("did:test:some-did-asdf"))
            .registryIds(Map.of("UID", "123456"));
        return request;
    }

    public static TrustOnboardingSubmission defaultSubmission() {
        var submission = new TrustOnboardingSubmission();
        submission
            .partnerId(TEST_PARTNER)
            .id(TEST_SUBMISSION_ID)
            .entityName(defaultEntityName())
            .address(defaultAddress())
            .contactPerson(defaultContact())
            .correspondingLanguage(Language.DE)
            .entityEmail("Email")
            .proofOfPossessions(
                List.of(
                    new ProofOfPossession()
                        .did("did:test:some-did-asdf")
                        .nonce(UUID.randomUUID().toString())
                        .status(ProofOfPossessionStatus.NOT_SUPPLIED)
                )
            )
            .registryIds(Map.of("UID", "123456"))
            .version(1L)
            .status(TrustOnboardingSubmissionStatus.UNSUBMITTED);
        return submission;
    }
}
