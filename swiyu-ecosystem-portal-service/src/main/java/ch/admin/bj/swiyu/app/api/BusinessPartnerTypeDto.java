package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "BusinessPartnerType")
public enum BusinessPartnerTypeDto {
    GOVERNMENTAL_INSTITUTION,
    BUSINESS,
    INDIVIDUAL,
    UNKNOWN, // Temporary type as part of migration for existing legacy partners
}
