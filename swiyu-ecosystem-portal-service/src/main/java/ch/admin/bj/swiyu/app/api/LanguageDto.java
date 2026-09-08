package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Language", enumAsRef = true)
public enum LanguageDto {
    EN,
    DE,
    FR,
    IT,
    RM,
}
