package com.dhruv.devtools.sql.dto;

import java.util.List;

public record QueryResult(
        List<String> columns,
        List<List<Object>> rows,
        long rowCount,
        long durationMs,
        boolean truncated,
        String statementType,
        Long queryRunId
) {}
