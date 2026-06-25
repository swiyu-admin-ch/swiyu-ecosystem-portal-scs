package ch.admin.bj.swiyu.app.infrastructure.web.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.client-api")
public record ClientApiProperties(@NotBlank String coreBusinessServiceBaseUrl) {}
