package ch.admin.bj.swiyu.app.infrastructure.web.config;

/**
 * Wraps the checked {@link Exception} declared by {@code HttpSecurity.build()} so that
 * security filter chain bean methods do not need to declare a generic {@code throws Exception}.
 */
public class SecurityFilterChainConfigurationException extends RuntimeException {

    public SecurityFilterChainConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
