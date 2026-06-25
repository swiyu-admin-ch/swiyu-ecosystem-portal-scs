package ch.admin.bj.swiyu.app.infrastructure.web.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(MediaType.APPLICATION_JSON);
    }

    /**
     * Dieser Controller wird benötigt, damit direkte Aufrufe auf eine Angular Route
     * nicht zu einem 404 führen. Der Controller leitet alle Anfragen an die index.html.
     *
     * <p>Note: das ist ein alternativer Ansatz zu <a href="https://bitbucket.bit.admin.ch/projects/JEAP/repos/jeap-spring-boot-template-scs/browse/jeap-spring-boot-template-scs/src/main/java/ch/admin/bit/jeap/template/config/WebConfig.java">jeap-spring-boot-template-scs</a>
     * mit dem Vorteil, dass kein 404 mehr kommt beim direkten Zugriff und wirklich nur die gewünschten Routes "geforwarded" werden.
     *
     * </p>
     */
    @Controller
    public static class ClientForwardingController {

        @GetMapping(path = { "/ui/**" })
        public String forwardAngularPaths() {
            return "forward:/index.html";
        }
    }
}
