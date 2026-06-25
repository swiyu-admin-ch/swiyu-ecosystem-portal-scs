package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "BusinessPartnerTrustStatus", enumAsRef = true)
public enum BusinessPartnerTrustStatusDto {
    NOT_VERIFIED,
    VERIFICATION_STARTED,
    VERIFICATION_IN_PROGRESS,
    INFORMATION_REQUESTED,
    VERIFIED,
    RE_VERIFICATION_STARTED,
    RE_VERIFICATION_IN_PROGRESS,
}
