package ch.admin.bj.swiyu.app.service;

import static org.assertj.core.api.Assertions.assertThat;

import ch.admin.bj.swiyu.app.api.RegistrationRequestDto;
import ch.admin.bj.swiyu.client.business.internal.model.PageMetadata;
import ch.admin.bj.swiyu.client.business.internal.model.PagedModelBusinessEntity;
import java.util.Collections;
import org.junit.jupiter.api.Test;

class BusinessEntityMapperTest {

    @Test
    void toRegistrationResponseDto() {
        // given
        var source = new RegistrationRequestDto("test", "test@test.ch");
        // when
        var result = BusinessEntityMapper.toCreateBusinessEntity(source);
        // then
        assertThat(result.getName()).isEqualTo("test");
        assertThat(result.getContactEmailAddress()).isEqualTo("test@test.ch");
    }

    @Test
    void toPageRegistrationResponseDto() {
        // given
        var source = new PagedModelBusinessEntity();
        PageMetadata page = new PageMetadata();
        page.setNumber(1L);
        page.setTotalPages(1L);
        page.setTotalElements(0L);
        page.setSize(0L);
        source.setPage(page);
        source.setContent(Collections.emptyList());
        // when
        var result = BusinessEntityMapper.toPageRegistrationResponseDto(source);
        // then
        assertThat(result).isNotNull();
    }
}
