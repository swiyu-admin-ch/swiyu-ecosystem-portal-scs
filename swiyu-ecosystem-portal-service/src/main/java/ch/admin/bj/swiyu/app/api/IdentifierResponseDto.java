package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(name = "IdentifierResponse")
public record IdentifierResponseDto(String did, UUID id, String description, IdentifierStatusDto status) {}
