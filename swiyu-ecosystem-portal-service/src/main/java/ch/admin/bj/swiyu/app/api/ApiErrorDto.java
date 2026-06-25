package ch.admin.bj.swiyu.app.api;

import ch.admin.bj.swiyu.app.exceptions.BusinessErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Schema(description = "Api error", name = "ApiError")
@Builder
@AllArgsConstructor
@NotNull
@Data
public class ApiErrorDto {

    private BusinessErrorCode errorCode;
    private String message;
    private String traceId;
    private List<String> additionalDetails;
}
