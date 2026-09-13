package com.dhruv.devtools.dto;

import java.util.List;

public record FileSearchResult(
        String fileName,
        long fileSizeBytes,
        long totalLines,
        long matchCount,
        List<FileSearchMatch> matches,
        boolean truncated
) {}
