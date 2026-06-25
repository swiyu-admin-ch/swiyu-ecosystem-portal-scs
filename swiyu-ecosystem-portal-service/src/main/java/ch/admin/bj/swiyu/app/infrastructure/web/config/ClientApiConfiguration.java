package ch.admin.bj.swiyu.app.infrastructure.web.config;

import ch.admin.bit.jeap.security.restclient.JeapOAuth2RestClientBuilderFactory;
import ch.admin.bj.swiyu.client.business.actuator.api.ActuatorApi;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerApi;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerV2Api;
import ch.admin.bj.swiyu.client.business.internal.api.IdentifierApi;
import ch.admin.bj.swiyu.client.business.internal.api.TrustOnboardingSubmissionApi;
import ch.admin.bj.swiyu.client.business.internal.invoker.ApiClient;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@AllArgsConstructor
public class ClientApiConfiguration {

    private final ClientApiProperties clientApiProperties;

    @Bean
    public BusinessPartnerV2Api businessPartnerV2Api(JeapOAuth2RestClientBuilderFactory factory) {
        // use jeap's rest client factory, so the invoking auth token is automatically added to the request and
        // observability is propagated as well (forward existing trace-id)
        var restClient = factory.createForTokenFromIncomingRequest().build();
        ApiClient apiClient = new ApiClient(restClient);
        apiClient.setBasePath(clientApiProperties.coreBusinessServiceBaseUrl());
        return new BusinessPartnerV2Api(apiClient);
    }

    @Bean
    public BusinessPartnerApi managementBusinessApi(JeapOAuth2RestClientBuilderFactory factory) {
        // use jeap's rest client factory, so the invoking auth token is automatically added to the request and
        // observability is propagated as well (forward existing trace-id)
        var restClient = factory.createForTokenFromIncomingRequest().build();
        ApiClient apiClient = new ApiClient(restClient);
        apiClient.setBasePath(clientApiProperties.coreBusinessServiceBaseUrl());
        return new BusinessPartnerApi(apiClient);
    }

    @Bean
    public TrustOnboardingSubmissionApi trustOnboardingSubmissionApi(JeapOAuth2RestClientBuilderFactory factory) {
        var restClient = factory.createForTokenFromIncomingRequest().build();
        ApiClient apiClient = new ApiClient(restClient);
        apiClient.setBasePath(clientApiProperties.coreBusinessServiceBaseUrl());
        return new TrustOnboardingSubmissionApi(apiClient);
    }

    @Bean
    public ActuatorApi coreBusinessActuatorApi(JeapOAuth2RestClientBuilderFactory factory) {
        var restClient = factory.createForTokenFromIncomingRequest().build();
        ch.admin.bj.swiyu.client.business.actuator.invoker.ApiClient apiClient =
            new ch.admin.bj.swiyu.client.business.actuator.invoker.ApiClient(restClient);
        apiClient.setBasePath(clientApiProperties.coreBusinessServiceBaseUrl());
        return new ActuatorApi(apiClient);
    }

    @Bean
    public IdentifierApi identifierApi(JeapOAuth2RestClientBuilderFactory factory) {
        var restClient = factory.createForTokenFromIncomingRequest().build();
        ApiClient apiClient = new ApiClient(restClient);
        apiClient.setBasePath(clientApiProperties.coreBusinessServiceBaseUrl());
        return new IdentifierApi(apiClient);
    }
}
