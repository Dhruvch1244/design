package com.dhruv.devtools.bigdata.dto;

import java.util.List;

public class CsvProfileResult {

    public record ColumnStat(
            String name,
            long nonNullCount,
            long nullCount,
            long approxDistinctCount,
            boolean distinctCountTruncated,
            List<String> sampleValues,
            String inferredType,
            String minValue,
            String maxValue
    ) {}

    public record Response(long totalRows, long malformedRowCount, List<ColumnStat> columns) {}
}
