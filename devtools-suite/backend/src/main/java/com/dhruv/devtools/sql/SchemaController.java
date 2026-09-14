package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.SchemaDto.SchemaResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sql/connections")
public class SchemaController {

    private final SchemaIntrospectionService schemaIntrospectionService;

    public SchemaController(SchemaIntrospectionService schemaIntrospectionService) {
        this.schemaIntrospectionService = schemaIntrospectionService;
    }

    @GetMapping("/{id}/schema")
    public SchemaResponse schema(@PathVariable Long id) {
        return schemaIntrospectionService.introspect(id);
    }
}
