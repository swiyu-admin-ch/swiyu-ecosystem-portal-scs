package ch.admin.bj.swiyu.app.infrastructure.web.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.admin.bit.jeap.security.test.WithJeapAuthenticationToken;
import ch.admin.bj.swiyu.client.business.internal.api.ProtectedVerificationSubmissionApi;
import ch.admin.bj.swiyu.client.business.internal.model.Contact;
import ch.admin.bj.swiyu.client.business.internal.model.PageMetadata;
import ch.admin.bj.swiyu.client.business.internal.model.PagedModelProtectedVerificationSubmissionListItem;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationCategory;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmission;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionListItem;
import ch.admin.bj.swiyu.client.business.internal.model.ProtectedVerificationSubmissionStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import tools.jackson.databind.ObjectMapper;

@ActiveProfiles("test")
@SpringBootTest(properties = { "features.EIDARTFE_1822_PROTECTED_VERIFICATION=true" })
@AutoConfigureMockMvc
class ProtectedVerificationSubmissionControllerIT {

    private static final UUID PARTNER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProtectedVerificationSubmissionApi protectedVerificationSubmissionApi;

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@protectedverificationsubmission_#write" }
    )
    void createProtectedVerificationSubmission_partnerAuthorized_returnsCreated() throws Exception {
        var payload = objectMapper.createObjectNode();
        payload.put("partnerId", PARTNER_ID.toString());
        payload.put("sbnId", UUID.randomUUID().toString());
        payload.put("entityName", "Hello World AG");
        payload.put("reason", "We need to verify the AHV number for compliance purposes.");
        payload.put("category", "PERSONAL_ADMINISTRATIVE_NUMBER");

        var response = new ProtectedVerificationSubmission()
            .id(UUID.randomUUID())
            .partnerId(PARTNER_ID)
            .sbnId(UUID.randomUUID())
            .entityName("Hello World AG")
            .category(ProtectedVerificationCategory.PERSONAL_ADMINISTRATIVE_NUMBER)
            .reason("We need to verify the AHV number for compliance purposes.")
            .status(ProtectedVerificationSubmissionStatus.SUBMITTED)
            .submittedAt(Instant.now());
        when(protectedVerificationSubmissionApi.createProtectedVerificationSubmission(any())).thenReturn(response);

        mockMvc
            .perform(
                MockMvcRequestBuilders.post("/api/v1/protected-verification-submissions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload.toString())
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.partnerId").value(PARTNER_ID.toString()))
            .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "11111111-1111-1111-1111-111111111111 = ti_@protectedverificationsubmission_#write" }
    )
    void createProtectedVerificationSubmission_partnerNotAuthorized_returnsForbidden() throws Exception {
        var payload = objectMapper.createObjectNode();
        payload.put("partnerId", PARTNER_ID.toString());
        payload.put("sbnId", UUID.randomUUID().toString());
        payload.put("entityName", "Hello World AG");
        payload.put("reason", "We need to verify the AHV number for compliance purposes.");
        payload.put("category", "PERSONAL_ADMINISTRATIVE_NUMBER");

        mockMvc
            .perform(
                MockMvcRequestBuilders.post("/api/v1/protected-verification-submissions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload.toString())
            )
            .andExpect(status().isForbidden());
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@protectedverificationsubmission_#read" }
    )
    void getProtectedVerificationCategories_returnsOk() throws Exception {
        when(protectedVerificationSubmissionApi.getProtectedVerificationCategories()).thenReturn(
            List.of(ProtectedVerificationCategory.PERSONAL_ADMINISTRATIVE_NUMBER)
        );

        mockMvc
            .perform(MockMvcRequestBuilders.get("/api/v1/protected-verification-submissions/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value("PERSONAL_ADMINISTRATIVE_NUMBER"));
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@protectedverificationsubmission_#read" }
    )
    void getProtectedVerificationSubmission_partnerAuthorized_returnsOk() throws Exception {
        var id = UUID.randomUUID();
        var response = new ProtectedVerificationSubmission()
            .id(id)
            .partnerId(PARTNER_ID)
            .sbnId(UUID.randomUUID())
            .entityName("Hello World AG")
            .contactPerson(
                new Contact().firstName("John").lastName("Doe").email("john.doe@example.com").phone("+41791234567")
            )
            .category(ProtectedVerificationCategory.PERSONAL_ADMINISTRATIVE_NUMBER)
            .reason("reason")
            .status(ProtectedVerificationSubmissionStatus.SUBMITTED)
            .submittedAt(Instant.now());
        when(protectedVerificationSubmissionApi.getProtectedVerificationSubmission(id)).thenReturn(response);

        mockMvc
            .perform(MockMvcRequestBuilders.get("/api/v1/protected-verification-submissions/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@protectedverificationsubmission_#read" }
    )
    void getLatestProtectedVerificationSubmission_noneExists_returnsNotFound() throws Exception {
        when(
            protectedVerificationSubmissionApi.getProtectedVerificationSubmissions(
                List.of(PARTNER_ID),
                0,
                1,
                List.of("updatedAt,desc")
            )
        ).thenReturn(new PagedModelProtectedVerificationSubmissionListItem().content(List.of()));

        mockMvc
            .perform(
                MockMvcRequestBuilders.get("/api/v1/protected-verification-submissions/latest").param(
                    "businessPartnerId",
                    PARTNER_ID.toString()
                )
            )
            .andExpect(status().isNotFound());
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@protectedverificationsubmission_#read" }
    )
    void getAllProtectedVerificationSubmissions_returnsListForAuthorizedPartner() throws Exception {
        var listItem = new ProtectedVerificationSubmissionListItem()
            .id(UUID.randomUUID())
            .partnerId(PARTNER_ID)
            .entityName("Hello World AG")
            .category(ProtectedVerificationCategory.PERSONAL_ADMINISTRATIVE_NUMBER)
            .status(ProtectedVerificationSubmissionStatus.SUBMITTED)
            .submittedAt(Instant.now())
            .createdAt(Instant.now())
            .updatedAt(Instant.now());
        when(
            protectedVerificationSubmissionApi.getProtectedVerificationSubmissions(any(), any(), any(), any())
        ).thenReturn(
            new PagedModelProtectedVerificationSubmissionListItem()
                .content(List.of(listItem))
                .page(new PageMetadata().totalElements(1L).totalPages(1L).size(20L).number(0L))
        );

        mockMvc
            .perform(
                MockMvcRequestBuilders.get("/api/v1/protected-verification-submissions")
                    .param("page", "0")
                    .param("size", "20")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].partnerId").value(PARTNER_ID.toString()));
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@protectedverificationsubmission_#read" }
    )
    void getAllProtectedVerificationSubmissions_filteredByBusinessPartnerId_callsInternalApiWithPartnerFilter()
        throws Exception {
        var listItem = new ProtectedVerificationSubmissionListItem()
            .id(UUID.randomUUID())
            .partnerId(PARTNER_ID)
            .entityName("Hello World AG")
            .category(ProtectedVerificationCategory.PERSONAL_ADMINISTRATIVE_NUMBER)
            .status(ProtectedVerificationSubmissionStatus.SUBMITTED)
            .submittedAt(Instant.now())
            .createdAt(Instant.now())
            .updatedAt(Instant.now());
        when(
            protectedVerificationSubmissionApi.getProtectedVerificationSubmissions(any(), any(), any(), any())
        ).thenReturn(
            new PagedModelProtectedVerificationSubmissionListItem()
                .content(List.of(listItem))
                .page(new PageMetadata().totalElements(1L).totalPages(1L).size(20L).number(0L))
        );

        mockMvc
            .perform(
                MockMvcRequestBuilders.get("/api/v1/protected-verification-submissions")
                    .param("businessPartnerId", PARTNER_ID.toString())
                    .param("page", "0")
                    .param("size", "20")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].partnerId").value(PARTNER_ID.toString()));

        verify(protectedVerificationSubmissionApi).getProtectedVerificationSubmissions(
            eq(List.of(PARTNER_ID)),
            eq(0),
            eq(20),
            any()
        );
    }
}
