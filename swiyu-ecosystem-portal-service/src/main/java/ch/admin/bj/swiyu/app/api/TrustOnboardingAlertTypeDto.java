package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Alerts that the backend evaluates for a trust onboarding submission and that the
 * frontend is expected to display. The evaluation must happen in the backend and must
 * not be re-implemented in the UI using if/else conditions.
 */
@Schema(name = "TrustOnboardingAlert", enumAsRef = true)
public enum TrustOnboardingAlertTypeDto {
    /** The submission requires adjustment after more information was requested. */
    INFORMATION_REQUESTED,
    /** The resubmission deadline is approaching (within the configured threshold). */
    RESUBMISSION_DEADLINE_APPROACHING,
    /** The resubmission deadline has passed and the submission can no longer be edited. */
    RESUBMISSION_DEADLINE_EXPIRED,
}
