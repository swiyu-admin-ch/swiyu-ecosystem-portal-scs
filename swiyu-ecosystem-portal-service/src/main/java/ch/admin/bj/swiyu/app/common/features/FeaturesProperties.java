package ch.admin.bj.swiyu.app.common.features;

import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Slf4j
@Data
@Validated
@ConfigurationProperties(prefix = "features")
public final class FeaturesProperties {

    @NotNull
    private Boolean eidartfe1122;

    @PostConstruct
    public void logFeatureFlags() {
        log.info(
            """
            Following features are configured:
              eidartfe1122:{}
            """,
            eidartfe1122
        );
    }
}
