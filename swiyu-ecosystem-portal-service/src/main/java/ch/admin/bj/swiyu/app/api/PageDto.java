package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "Representing a Page used for pagination", name = "Page")
public record PageDto<T>(
    @NotNull List<T> content,
    @NotNull long totalPages,
    @NotNull long totalElements,
    @NotNull long size,
    @NotNull long number
) {}
