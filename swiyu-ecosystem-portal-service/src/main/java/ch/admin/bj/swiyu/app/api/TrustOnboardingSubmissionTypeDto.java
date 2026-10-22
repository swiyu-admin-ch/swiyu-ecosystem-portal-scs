package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "TrustOnboardingSubmissionType", enumAsRef = true)
public enum TrustOnboardingSubmissionTypeDto {
    REGISTRATION,
    PROFILE_CHANGE_MANDATORY,
    PROFILE_CHANGE_VOLUNTARY,
    RENEWAL,
}
