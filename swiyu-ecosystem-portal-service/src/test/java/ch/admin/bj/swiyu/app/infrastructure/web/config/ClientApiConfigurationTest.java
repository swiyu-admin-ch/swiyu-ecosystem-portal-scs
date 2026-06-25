package ch.admin.bj.swiyu.app.infrastructure.web.config;

import static org.assertj.core.api.Assertions.*;

import java.io.*;
import java.nio.file.*;
import org.junit.jupiter.api.*;

class ClientApiConfigurationTest {

    /**
     * There is a bug in openapi generator that prevents generating useable ApiClient classes.
     * We need to remove the lines around "{ "OIDC" : []}" so the generation works.
     * <p>
     * See <a href="https://github.com/OpenAPITools/openapi-generator/issues/19168">Github Issue</a>
     */
    @Test
    void checkOidcSchemeIsRemovedFromOpenApiSpec() throws IOException {
        // GIVEN (all Openapi Specs)
        var directory = new File("specs");
        var files = directory.listFiles();
        assertThat(files).hasSize(4);
        for (File file : files) {
            // WHEN
            var json = Files.readString(Path.of(file.getPath())).replaceAll("\\s+", "");
            // THEN
            if (json.contains("\"OIDC\":[]")) {
                throw new AssertionError(
                    String.format(
                        """
                        OpenID schema %s contains security schema { 'OIDC' : [] }.
                        This is not supported currently in Open API generator.
                        Please remove these lines from the OpenAPI spec and regenerate the Api Client.
                        See https://github.com/OpenAPITools/openapi-generator/issues/19168
                        """,
                        file.getName()
                    )
                );
            }
        }
    }
}
