package com.dhruv.devtools.bigdata.dto;

import java.util.List;

public record PartMergeResult(
        String outputPath,
        long filesMerged,
        long totalBytesWritten,
        List<String> mergedFileNames
) {}
