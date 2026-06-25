package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.assertj.core.api.Assertions.assertThat;

import ch.admin.bj.swiyu.app.api.AppConfigDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class AppConfigControllerIT {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void getConfiguration() throws Exception {
        // GIVEN / WHEN
        var json = mockMvc
            .perform(MockMvcRequestBuilders.get("/api/app-config"))
            .andReturn()
            .getResponse()
            .getContentAsString();
        var appConfig = objectMapper.readValue(json, AppConfigDto.class);
        // THEN
        assertThat(appConfig.banner()).isEqualTo("test");
        assertThat(appConfig.authConfig()).isNotNull();
        assertThat(appConfig.eportalConfig()).isNotNull();
        assertThat(appConfig.functionalityConfig()).isNotNull();
        assertThat(appConfig.functionalityConfig().primaryEnvironmentEnabled()).isTrue();
    }
}
