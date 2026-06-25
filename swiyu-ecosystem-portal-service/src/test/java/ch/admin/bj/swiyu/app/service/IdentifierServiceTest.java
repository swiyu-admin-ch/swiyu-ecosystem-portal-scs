package ch.admin.bj.swiyu.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import ch.admin.bj.swiyu.app.api.IdentifierResponseDto;
import ch.admin.bj.swiyu.client.business.internal.api.IdentifierApi;
import ch.admin.bj.swiyu.client.business.internal.model.IdentifierEntry;
import ch.admin.bj.swiyu.client.business.internal.model.PageMetadata;
import ch.admin.bj.swiyu.client.business.internal.model.PagedModelIdentifierEntry;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@ActiveProfiles("test")
@SpringBootTest
class IdentifierServiceTest {

    @Autowired
    private IdentifierService identifierService;

    @MockitoBean
    private IdentifierApi identifierB2BApi;

    private UUID organisationId;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        organisationId = UUID.randomUUID();
        pageable = new Pageable(0, 10, Collections.emptyList());
    }

    @Test
    void getIdentifiersOfOrganisation_shouldReturnPageOfIdentifierResponseDto() {
        // Given
        IdentifierEntry identifierEntry = new IdentifierEntry();
        identifierEntry.setDid("did:swiyu:123");
        identifierEntry.setStatus(IdentifierEntry.StatusEnum.INITIALIZED);
        List<IdentifierEntry> identifierEntries = Collections.singletonList(identifierEntry);

        var page = new PageMetadata();
        page.setTotalPages(1L);
        page.setTotalElements((long) identifierEntries.size());
        page.setNumber(0L);
        page.setSize(pageable.getSize().longValue());
        var pagedModel = new PagedModelIdentifierEntry();
        pagedModel.setPage(page);
        pagedModel.setContent(identifierEntries);

        when(
            identifierB2BApi.getAllIdentifierEntries(
                organisationId,
                pageable.getPage(),
                pageable.getSize(),
                pageable.getSort()
            )
        ).thenReturn(pagedModel);

        // When
        Page<IdentifierResponseDto> result = identifierService.getIdentifiersOfOrganisation(organisationId, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("did:swiyu:123", result.getContent().getFirst().did());
    }

    @Test
    void getIdentifiersOfOrganisation_shouldReturnEmptyPage_whenNoIdentifiersFound() {
        // Given
        var page = new PageMetadata();
        page.setTotalPages(0L);
        page.setNumber(0L);
        page.setTotalElements(0L);
        page.setSize(pageable.getSize().longValue());
        var pagedModel = new PagedModelIdentifierEntry();
        pagedModel.setPage(page);

        when(
            identifierB2BApi.getAllIdentifierEntries(
                organisationId,
                pageable.getPage(),
                pageable.getSize(),
                pageable.getSort()
            )
        ).thenReturn(pagedModel);

        // When
        Page<IdentifierResponseDto> result = identifierService.getIdentifiersOfOrganisation(organisationId, pageable);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertEquals(0, result.getContent().size());
    }
}
