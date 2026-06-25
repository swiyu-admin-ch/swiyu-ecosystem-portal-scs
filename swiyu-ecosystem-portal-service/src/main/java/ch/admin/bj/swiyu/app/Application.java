package ch.admin.bj.swiyu.app;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@Slf4j
@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
@ConfigurationPropertiesScan
public class Application {

    public static void main(String[] args) {
        var env = SpringApplication.run(Application.class, args).getEnvironment();
        var appName = env.getProperty("spring.application.name");
        var serverPort = env.getProperty("server.port");

        log.info(
            """

            ----------------------------------------------------------------------------
            \t'{}' is running!\s
            \tProfile(s): \t\t\t\t{}
            \tFrontend (node):  \t\t\thttp://localhost:4501
            \tFrontend (bundled):  \t\thttp://localhost:{}
            \tSwaggerUI:   \t\t\t\thttp://localhost:{}/swagger-ui.html
            ----------------------------------------------------------------------------""",
            appName,
            env.getActiveProfiles(),
            serverPort,
            serverPort
        );
    }
}
