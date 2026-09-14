package com.dhruv.devtools.dto;

import java.util.List;

public record FileSearchResult(
        String fileName,
        long fileSizeBytes,
        long totalLines,
        long totalMatches,
        List<TermMatches> termResults
) {}
