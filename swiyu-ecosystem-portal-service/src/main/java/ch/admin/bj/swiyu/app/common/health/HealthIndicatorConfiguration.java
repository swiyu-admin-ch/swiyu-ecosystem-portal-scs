package ch.admin.bj.swiyu.app.common.health;

import static org.springframework.boot.health.contributor.Status.UP;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class HealthIndicatorConfiguration {

    // core business service runs as multiple pods behind a load balancer; during its own rolling deployment a
    // single call can land on a pod that is still starting up or draining, so we retry a few times before
    // concluding the whole service is down. The check runs on a schedule instead of inline with the actuator
    // health request, so liveness/readiness probes are never blocked on the retries.
    private static final int MAX_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MILLIS = 300;

    private final ch.admin.bj.swiyu.client.business.actuator.api.ActuatorApi coreBusinessServiceActuatorApi;

    private final AtomicReference<Health> coreBusinessHealth = new AtomicReference<>(Health.unknown().build());

    /*
     * Needed to check health of core business serivce.
     */
    @Bean
    public HealthIndicator coreBusinessHealthIndicator() {
        return coreBusinessHealth::get;
    }

    @Scheduled(fixedRate = 15_000, initialDelay = 0)
    void cronCheckCoreBusinessServiceHealth() {
        coreBusinessHealth.set(checkCoreBusinessServiceHealth());
    }

    private Health checkCoreBusinessServiceHealth() {
        Exception lastException = null;
        for (var attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                log.debug("checking health of core business service (attempt {}/{})...", attempt, MAX_ATTEMPTS);
                var health = coreBusinessServiceActuatorApi.health();
                validateIsUp(health);
                return Health.up().build();
            } catch (Exception e) {
                lastException = e;
                if (attempt < MAX_ATTEMPTS) {
                    log.warn(
                        "health check of core business service failed on attempt {}/{}, retrying...",
                        attempt,
                        MAX_ATTEMPTS,
                        e
                    );
                    sleepBeforeRetry();
                }
            }
        }
        log.error("health check failed for management business service", lastException);
        return Health.down().withException(lastException).build();
    }

    private static void sleepBeforeRetry() {
        try {
            Thread.sleep(RETRY_DELAY_MILLIS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void validateIsUp(Object health) {
        if (!isUp(health)) {
            throw new IllegalStateException("health endpoint of service did not response with status UP");
        }
    }

    private static boolean isUp(Object health) {
        return health instanceof Map && ((Map<?, ?>) health).get("status").equals(UP.getCode());
    }
}
