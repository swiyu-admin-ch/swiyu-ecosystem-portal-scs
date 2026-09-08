package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.client.business.internal.model.BusinessPartnerType;
import ch.admin.bj.swiyu.client.business.internal.model.Language;
import ch.admin.bj.swiyu.client.business.internal.model.Signatory;
import ch.admin.bj.swiyu.client.business.internal.model.SigningRule;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Schema(name = "TrustOnboardingSubmissionRequest")
public record TrustOnboardingSubmissionRequestDto(
    UUID partnerId,
    Map<String, String> entityName,
    AddressDto entityAddress,
    String entityEmail,
    ContactDto contactPerson,
    SigningRule signingRule,
    List<Signatory> signatories,
    Map<String, String> registryIds,
    Boolean isRegisteredInCommercialRegister,
    Language correspondingLanguage,
    List<String> dids,
    BusinessPartnerType requestedPartnerType
) {}
