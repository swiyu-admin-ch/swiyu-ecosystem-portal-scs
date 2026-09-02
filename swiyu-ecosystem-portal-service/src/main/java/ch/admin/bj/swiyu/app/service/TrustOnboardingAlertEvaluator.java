package ch.admin.bj.swiyu.app.service;

import static ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmissionStatus.INFORMATION_REQUESTED;

import ch.admin.bj.swiyu.app.api.TrustOnboardingAlertTypeDto;
import ch.admin.bj.swiyu.client.business.internal.model.TrustOnboardingSubmission;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;

/**
 * Evaluates which {@link TrustOnboardingAlertTypeDto alerts} to surface for a trust onboarding
 * submission. The evaluation is done here in the backend and deliberately NOT in the UI, so the
 * frontend only renders the returned alerts.
 *
 * <p>The resubmission deadline is <em>not</em> read from the submission directly. It is passed in as
 * {@code maxDateForStatus} from the centralized verification-progress endpoint, which is the single
 * source of truth for any UI deadline (chip and alerts), so that all consumers agree on the same
 * deadline (including the fallback applied upstream).
 */
@UtilityClass
public class TrustOnboardingAlertEvaluator {

    static final Duration APPROACH_THRESHOLD = Duration.ofDays(14);

    public static List<TrustOnboardingAlertTypeDto> evaluate(
        TrustOnboardingSubmission submission,
        Instant maxDateForStatus
    ) {
        return evaluate(submission, maxDateForStatus, Instant.now());
    }

    static List<TrustOnboardingAlertTypeDto> evaluate(
        TrustOnboardingSubmission submission,
        Instant maxDateForStatus,
        Instant now
    ) {
        var alerts = new ArrayList<TrustOnboardingAlertTypeDto>();
        var status = submission.getStatus();
        if (status != INFORMATION_REQUESTED) {
            return List.copyOf(alerts);
        }

        alerts.add(TrustOnboardingAlertTypeDto.INFORMATION_REQUESTED);

        var deadline = maxDateForStatus;
        if (deadline == null) {
            return List.copyOf(alerts);
        }
        if (deadline.isBefore(now)) {
            alerts.add(TrustOnboardingAlertTypeDto.RESUBMISSION_DEADLINE_EXPIRED);
        } else if (deadline.isBefore(now.plus(APPROACH_THRESHOLD))) {
            alerts.add(TrustOnboardingAlertTypeDto.RESUBMISSION_DEADLINE_APPROACHING);
        }
        return List.copyOf(alerts);
    }
}
