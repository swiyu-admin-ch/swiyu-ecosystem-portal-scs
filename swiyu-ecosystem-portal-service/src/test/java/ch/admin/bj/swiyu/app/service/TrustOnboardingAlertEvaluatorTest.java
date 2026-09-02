package ch.admin.bj.swiyu.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import ch.admin.bj.swiyu.app.api.TrustOnboardingAlertTypeDto;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmission;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionStatus;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class TrustOnboardingAlertEvaluatorTest {

    private final Instant now = Instant.parse("2026-08-26T10:00:00Z");

    private TrustOnboardingSubmission submission(TrustOnboardingSubmissionStatus status) {
        var submission = new TrustOnboardingSubmission();
        submission.setStatus(status);
        return submission;
    }

    @Test
    void returns_no_alerts_when_submission_is_unsubmitted() {
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(submission(TrustOnboardingSubmissionStatus.UNSUBMITTED), null, now)
        ).isEmpty();
    }

    @Test
    void returns_no_alerts_when_submission_is_submitted() {
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(submission(TrustOnboardingSubmissionStatus.SUBMITTED), null, now)
        ).isEmpty();
    }

    @Test
    void returns_information_requested_when_no_deadline() {
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(
                submission(TrustOnboardingSubmissionStatus.INFORMATION_REQUESTED),
                null,
                now
            )
        ).containsExactly(TrustOnboardingAlertTypeDto.INFORMATION_REQUESTED);
    }

    @Test
    void returns_information_requested_and_approaching_when_deadline_within_threshold() {
        var deadline = now.plusSeconds(3600);
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(
                submission(TrustOnboardingSubmissionStatus.INFORMATION_REQUESTED),
                deadline,
                now
            )
        ).containsExactly(
            TrustOnboardingAlertTypeDto.INFORMATION_REQUESTED,
            TrustOnboardingAlertTypeDto.RESUBMISSION_DEADLINE_APPROACHING
        );
    }

    @Test
    void returns_only_information_requested_when_deadline_far_in_future() {
        var deadline = now.plus(TrustOnboardingAlertEvaluator.APPROACH_THRESHOLD).plusSeconds(1);
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(
                submission(TrustOnboardingSubmissionStatus.INFORMATION_REQUESTED),
                deadline,
                now
            )
        ).containsExactly(TrustOnboardingAlertTypeDto.INFORMATION_REQUESTED);
    }

    @Test
    void returns_information_requested_and_expired_when_deadline_passed() {
        var deadline = now.minusSeconds(3600);
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(
                submission(TrustOnboardingSubmissionStatus.INFORMATION_REQUESTED),
                deadline,
                now
            )
        ).containsExactly(
            TrustOnboardingAlertTypeDto.INFORMATION_REQUESTED,
            TrustOnboardingAlertTypeDto.RESUBMISSION_DEADLINE_EXPIRED
        );
    }

    @Test
    void returns_no_alerts_when_submission_is_resubmitted() {
        assertThat(
            TrustOnboardingAlertEvaluator.evaluate(submission(TrustOnboardingSubmissionStatus.RESUBMITTED), null, now)
        ).isEmpty();
    }
}
