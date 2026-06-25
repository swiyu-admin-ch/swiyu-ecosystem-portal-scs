package ch.admin.bj.swiyu.app;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.context.*;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.*;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class ApplicationIT {

    @Autowired
    MockMvc mockMvc;

    @Test
    void testNotFound() throws Exception {
        mockMvc
            .perform(MockMvcRequestBuilders.get("/robots.txt"))
            .andExpect(result -> assertThat(result.getResponse().getStatus()).isEqualTo(404));
    }

    @Test
    void testHttpMaxRedirectsSystemPropertyIsSet() {
        var maxRedirects = System.getProperty("http.maxRedirects");
        assertEquals("5", maxRedirects);
    }
}
