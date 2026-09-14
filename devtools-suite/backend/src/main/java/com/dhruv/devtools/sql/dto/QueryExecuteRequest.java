package com.dhruv.devtools.sql.dto;

import java.util.Map;

public record QueryExecuteRequest(
        Long connectionId,
        String sql,
        Map<String, String> params,
        Integer maxRows,
        Integer timeoutSeconds,
        Long savedQueryId,
        boolean explain
) {}
