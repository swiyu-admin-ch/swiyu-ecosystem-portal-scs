package ch.admin.bj.swiyu.app.infrastructure.web.config;

import static org.springframework.http.HttpMethod.*;

import java.util.*;
import java.util.stream.*;
import lombok.*;
import org.springframework.context.annotation.*;
import org.springframework.core.annotation.*;
import org.springframework.security.config.annotation.web.builders.*;
import org.springframework.security.config.annotation.web.configuration.*;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.*;
import org.springframework.security.web.servlet.util.matcher.*;
import org.springframework.security.web.util.matcher.*;
import org.springframework.web.cors.*;

/**
 * Note: Most of the security config comes via MvcSecurityConfiguration from JEAP.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private static final String[] PUBLIC_STATIC_RESOURCES = {
        "/assets/**",
        "/robots.txt",
        "/*.ico",
        "/*.svg",
        "/*.woff",
        "/*.woff2",
        "/media/*.woff2",
        "/*.ttf",
        "/*.js",
        "/*.css",
        "/*.map",
    };

    private static final String[] DENIED_STATIC_RESOURCES = {
        // swagger-ui.js gibt es gar nicht, aber Security Scans nutzen das scheinbar als Angriffsvektor
        // was bei uns zu unnötigen LogAlerts führt.
        "/swagger-ui.js",
    };

    /**
     * Angular Routes.
     */
    private static final String[] PUBLIC_UI_ROUTES = { "/", "/index.html", "/ui/**" };

    private static final String[] PUBLIC_API = { "/api/app-config" };

    private static final RequestMatcher[] PUBLIC_GET_ENDPOINTS = Stream.of(
        Stream.of(PUBLIC_STATIC_RESOURCES),
        Stream.of(PUBLIC_UI_ROUTES),
        Stream.of(PUBLIC_API)
    )
        .flatMap(s -> s)
        .map(s -> PathPatternRequestMatcher.withDefaults().matcher(GET, s))
        .toArray(PathPatternRequestMatcher[]::new);

    private static final RequestMatcher[] DENIED_GET_ENDPOINTS = Stream.of(Stream.of(DENIED_STATIC_RESOURCES))
        .flatMap(s -> s)
        .map(s -> PathPatternRequestMatcher.withDefaults().matcher(GET, s))
        .toArray(PathPatternRequestMatcher[]::new);

    private final CorsProperties corsProperties;

    /**
     * Zusätlziche Endpoints welche wir explizit verbieten, bspw. durch Erkenntnisse von Security Scans.
     */
    @Bean
    @Order(99)
    SecurityFilterChain deniedEndpointsFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(RequestMatchers.anyOf(DENIED_GET_ENDPOINTS))
            .authorizeHttpRequests(auth -> auth.anyRequest().denyAll());
        return http.build();
    }

    /**
     * Ergänzt die Security Chain aus JEAP's MvcSecurityConfiguration um Public Endpoints zuzulassen.
     */
    @Bean
    @Order(100)
    SecurityFilterChain publicEndpointsFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(RequestMatchers.anyOf(PUBLIC_GET_ENDPOINTS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        // The silent refresh opens in an iframe, which is only allowed with the SAMEORIGIN X-Frame-Options
        http.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.allowedOrigins());
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
