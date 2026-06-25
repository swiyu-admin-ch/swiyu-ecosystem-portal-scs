package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "IdentifierStatus", enumAsRef = true)
public enum IdentifierStatusDto {
    NOT_INITIALIZED,
    INITIALIZED,
    USER_DEACTIVATED,
    // we currently only support did:tdw:0.3 and up
    DEACTIVATED_BY_MIGRATION_BECAUSE_OF_UNSUPPORTED_FORMAT,
}
