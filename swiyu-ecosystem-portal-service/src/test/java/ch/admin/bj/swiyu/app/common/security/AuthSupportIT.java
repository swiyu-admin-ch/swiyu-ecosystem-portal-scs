package ch.admin.bj.swiyu.app.common.security;

import static org.junit.jupiter.api.Assertions.*;

import ch.admin.bit.jeap.security.test.WithJeapAuthenticationToken;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class AuthSupportIT {

    @Autowired
    AuthSupport authSupport;

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@trustonboardingsubmission_#read" }
    )
    void hasRoleForPartners() {
        // Given
        var partnerIds = List.of(UUID.fromString("00000000-0000-0000-0000-000000000000"));
        // WHEN
        var result = authSupport.hasRoleForPartners("trustonboardingsubmission", "read", partnerIds);
        // THEN
        assertTrue(result);
    }

    @Test
    @WithJeapAuthenticationToken(
        bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@trustonboardingsubmission_#read" }
    )
    void hasRoleForPartners_ShouldFail() {
        // Given
        var partnerIds = List.of(
            UUID.fromString("00000000-0000-0000-0000-000000000000"),
            UUID.fromString("00000000-0000-0000-0000-000000000001")
        );
        // WHEN
        var result = authSupport.hasRoleForPartners("trustonboardingsubmission", "read", partnerIds);
        // THEN
        assertFalse(result);
    }

    @Test
    @WithJeapAuthenticationToken(
        // partner id from application-test.yml
        bpRoles = { "40f377d5-cd11-458a-944b-0c4f73f2ddaa = ti_@businesspartner_#write" }
    )
    void isGovernmentalAllowlistUser_IsTrue() {
        assertTrue(authSupport.isGovernmentalAllowlistUser());
    }

    @Test
    @WithJeapAuthenticationToken(bpRoles = { "00000000-0000-0000-0000-000000000000 = ti_@businesspartner_#write" })
    void isGovernmentalAllowlistUser_IsFalse() {
        assertFalse(authSupport.isGovernmentalAllowlistUser());
    }
}
