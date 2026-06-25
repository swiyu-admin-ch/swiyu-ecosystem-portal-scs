package ch.admin.bj.swiyu.app.common.stream;

import lombok.*;
import org.springframework.core.io.*;
import org.springframework.web.multipart.*;

/**
 * Wraps MultipartFile instances to be used with the AbstractResource from spring.
 * Allows to proxy a MultipartFile from frontend through backend to a second service.
 */
@EqualsAndHashCode(callSuper = true)
public class MultipartFileResource extends InputStreamResource {

    MultipartFile file;

    public MultipartFileResource(MultipartFile file) {
        super(file);
        this.file = file;
    }

    @Override
    public String getFilename() {
        return file.getOriginalFilename();
    }

    @Override
    public long contentLength() {
        return file.getSize();
    }
}
