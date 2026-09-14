package com.dhruv.devtools.sql.dto;

import java.util.List;

/** Client sends exactly the rows/columns currently in the grid — saving is "what you see", not a re-run. */
public record SampleOutputRequest(
        Long queryRunId,
        Long savedQueryId,
        String label,
        List<String> columns,
        List<List<Object>> rows,
        List<String> redactColumns
) {}
