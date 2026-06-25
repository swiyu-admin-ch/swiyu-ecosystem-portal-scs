package ch.admin.bj.swiyu.app.common.security;

import static org.springframework.util.CollectionUtils.isEmpty;

import ch.admin.bit.jeap.security.resource.semanticAuthentication.ServletSemanticAuthorization;
import java.util.Collection;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Wrapper around jeap's ServletSemanticAuthorization with certain convenience methods.
 */
@Component
@Slf4j
@AllArgsConstructor
public class AuthSupport {

    private final GovernmentalAllowlistProperties governmentalAllowlistProperties;
    private final ServletSemanticAuthorization jeapAuthorization;

    /**
     * Checks if the current user has the given role for all of the given partnerIds. Can be used with @PreAuthorize
     * like this:
     *
     * <pre>
     * {@code
     * @PostAuthorize("@authSupport.hasRoleForPartners('businesspartner', 'read', returnObject.content.![id])")
     * public PagedModel<BusinessPartnerDto> getBusinessPartners() { ... }
     * }
     * </pre>
     */
    public boolean hasRoleForPartners(String resource, String operation, Collection<UUID> partnerIds) {
        if (isEmpty(partnerIds)) {
            return true; // no content means nothing to authorize
        }
        for (var partnerId : partnerIds) {
            if (!jeapAuthorization.hasRoleForPartner(resource, operation, partnerId.toString())) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns true if the current user has the business partner role <code>@businesspartner_#write</code> for the
     * "Swiyu Governmental Allowlist" partner.
     */
    public boolean isGovernmentalAllowlistUser() {
        return jeapAuthorization.hasRoleForPartner(
            "businesspartner",
            "write",
            this.governmentalAllowlistProperties.partnerId().toString()
        );
    }
}
