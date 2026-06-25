package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "PamsEnvironment", enumAsRef = true)
public enum PamsEnvironmentDto {
    DEV,
    REF,
    TEST,
    ABN,
    PROD,
}
