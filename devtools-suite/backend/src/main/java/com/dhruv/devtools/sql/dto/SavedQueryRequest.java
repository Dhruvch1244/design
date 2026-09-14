package com.dhruv.devtools.sql.dto;

import java.util.List;

public record SavedQueryRequest(
        String name,
        String description,
        String sqlText,
        Long connectionId,
        List<String> paramNames,
        String tags,
        boolean favourite
) {}
