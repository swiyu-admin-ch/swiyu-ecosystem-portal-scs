package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.admin.bit.jeap.security.test.WithJeapAuthenticationToken;
import ch.admin.bj.swiyu.client.business.internal.api.BusinessPartnerApi;
import ch.admin.bj.swiyu.client.business.internal.model.BusinessEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class RegistrationControllerIT {

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    MockMvc mockMvc;

    @MockitoBean(answers = Answers.RETURNS_DEEP_STUBS)
    private BusinessPartnerApi managementBusinessApi;

    @Test
    @WithJeapAuthenticationToken(bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@businesspartner_#write" })
    void validRegistration() throws Exception {
        // GIVEN
        var payload = objectMapper.createObjectNode();
        var organizationName = "string";
        payload.put("organizationName", organizationName);
        var technicalEmailAddress = "string@example.de";
        payload.put("technicalEmailAddress", technicalEmailAddress);

        var businessEntity = new BusinessEntity();
        businessEntity.setId(UUID.fromString("00000000-0000-0000-0000-000000000000"));
        businessEntity.setName(organizationName);
        businessEntity.setContactEmailAddress(technicalEmailAddress);

        Mockito.when(managementBusinessApi.createBusinessEntity(ArgumentMatchers.any())).thenReturn(businessEntity);

        // WHEN
        mockMvc
            .perform(
                MockMvcRequestBuilders.post("/api/registration/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload.toString())
            )
            // THEN
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value(organizationName))
            .andExpect(jsonPath("$.contactEmailAddress").value(technicalEmailAddress))
            .andExpect(jsonPath("$.id").isNotEmpty());
    }
}
