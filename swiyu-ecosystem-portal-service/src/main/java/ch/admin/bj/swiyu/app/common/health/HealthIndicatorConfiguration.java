package ch.admin.bj.swiyu.app.common.health;

import static org.springframework.boot.actuate.health.Status.UP;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class HealthIndicatorConfiguration {

    private final ch.admin.bj.swiyu.client.business.actuator.api.ActuatorApi coreBusinessServiceActuatorApi;

    /*
     * Needed to check health of core business serivce.
     */
    @Bean
    public HealthIndicator coreBusinessHealthIndicator() {
        return () -> {
            try {
                log.debug("checking health of core business service...");
                var health = coreBusinessServiceActuatorApi.health();
                validateIsUp(health);
                return Health.up().build();
            } catch (Exception e) {
                log.error("health check failed for management business service", e);
                return Health.down().withException(e).build();
            }
        };
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
