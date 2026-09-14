package com.dhruv.devtools.dto;

import java.util.List;

public record PathSearchRequest(
        String path,
        List<String> terms,
        boolean regex,
        boolean caseSensitive,
        Long maxSizeBytes,
        String charset
) {}
