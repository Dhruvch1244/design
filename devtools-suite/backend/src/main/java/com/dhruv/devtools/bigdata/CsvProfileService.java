package com.dhruv.devtools.bigdata;

import com.dhruv.devtools.bigdata.dto.CsvProfileResult.ColumnStat;
import com.dhruv.devtools.bigdata.dto.CsvProfileResult.Response;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Profiles a delimited file column-by-column without ever holding the whole file in memory —
 * same streaming approach as FileSearchService, since a CSV profiler is exactly the kind of tool
 * someone reaches for on a file too big to open in Excel. Distinct-value tracking is capped per
 * column so a high-cardinality ID column can't blow up the heap; past the cap it's reported as
 * "many" rather than an exact count.
 */
@Service
public class CsvProfileService {

    private static final int MAX_DISTINCT_TRACKED = 2_000;
    private static final int MAX_SAMPLE_VALUES = 5;
    private static final int READ_BUFFER_CHARS = 1 << 16;
    private static final int MAX_LINE_CHARS = 1 << 20;

    private static final Pattern INT_PATTERN = Pattern.compile("^-?\\d+$");
    private static final Pattern FLOAT_PATTERN = Pattern.compile("^-?\\d+\\.\\d+$");
    private static final Pattern DATE_PATTERN = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}.*)?$");

    public Response profilePath(String rawPath, String delimiter, boolean hasHeader) throws IOException {
        Path path = Path.of(rawPath.trim());
        if (!Files.exists(path)) throw new IllegalArgumentException("No such file: " + path);
        if (!Files.isRegularFile(path)) throw new IllegalArgumentException("Not a regular file: " + path);
        if (!Files.isReadable(path)) throw new IllegalArgumentException("File is not readable: " + path);

        try (InputStream in = Files.newInputStream(path)) {
            return profile(in, delimiter.charAt(0), hasHeader);
        }
    }

    public Response profile(InputStream rawIn, char delimiter, boolean hasHeader) throws IOException {
        Reader reader = new InputStreamReader(rawIn, StandardCharsets.UTF_8);

        List<String> headerNames = null;
        List<ColumnAccumulator> accumulators = null;
        long totalRows = 0;
        long malformedRows = 0;
        int expectedColumns = -1;

        char[] buf = new char[READ_BUFFER_CHARS];
        StringBuilder current = new StringBuilder();
        int n;
        boolean firstLine = true;

        while ((n = reader.read(buf)) != -1) {
            for (int i = 0; i < n; i++) {
                char c = buf[i];
                if (c == '\n') {
                    String line = current.toString();
                    current.setLength(0);
                    if (!line.isEmpty()) {
                        List<String> fields = splitCsvLine(line, delimiter);
                        if (firstLine && hasHeader) {
                            headerNames = fields;
                            expectedColumns = fields.size();
                            accumulators = initAccumulators(headerNames);
                        } else {
                            if (expectedColumns == -1) {
                                expectedColumns = fields.size();
                                headerNames = defaultNames(expectedColumns);
                                accumulators = initAccumulators(headerNames);
                            }
                            if (fields.size() != expectedColumns) {
                                malformedRows++;
                            } else {
                                for (int col = 0; col < fields.size(); col++) {
                                    accumulators.get(col).accept(fields.get(col));
                                }
                                totalRows++;
                            }
                        }
                        firstLine = false;
                    }
                } else if (c != '\r') {
                    if (current.length() < MAX_LINE_CHARS) current.append(c);
                }
            }
        }
        if (current.length() > 0 && accumulators != null) {
            List<String> fields = splitCsvLine(current.toString(), delimiter);
            if (fields.size() == expectedColumns) {
                for (int col = 0; col < fields.size(); col++) accumulators.get(col).accept(fields.get(col));
                totalRows++;
            } else {
                malformedRows++;
            }
        }

        if (accumulators == null) return new Response(0, 0, List.of());

        List<ColumnStat> columns = new ArrayList<>();
        for (int i = 0; i < accumulators.size(); i++) {
            columns.add(accumulators.get(i).toStat(headerNames.get(i)));
        }
        return new Response(totalRows, malformedRows, columns);
    }

    private List<String> defaultNames(int count) {
        List<String> names = new ArrayList<>();
        for (int i = 0; i < count; i++) names.add("col" + (i + 1));
        return names;
    }

    private List<ColumnAccumulator> initAccumulators(List<String> names) {
        List<ColumnAccumulator> list = new ArrayList<>();
        for (int i = 0; i < names.size(); i++) list.add(new ColumnAccumulator());
        return list;
    }

    /** Respects double-quoted fields and "" escaped quotes — the one thing naive delimiter.split() gets wrong. */
    private List<String> splitCsvLine(String line, char delimiter) {
        List<String> fields = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        cur.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cur.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == delimiter) {
                fields.add(cur.toString());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        fields.add(cur.toString());
        return fields;
    }

    private static class ColumnAccumulator {
        long nonNull = 0;
        long nullCount = 0;
        long intCount = 0, floatCount = 0, dateCount = 0, stringCount = 0;
        Double min = null, max = null;
        boolean numericRange = true;
        Set<String> distinct = new LinkedHashSet<>();
        boolean truncated = false;

        void accept(String value) {
            if (value == null || value.isEmpty()) {
                nullCount++;
                return;
            }
            nonNull++;
            if (distinct.size() < MAX_DISTINCT_TRACKED) {
                distinct.add(value);
            } else {
                truncated = true;
            }

            if (INT_PATTERN.matcher(value).matches()) {
                intCount++;
                trackRange(value);
            } else if (FLOAT_PATTERN.matcher(value).matches()) {
                floatCount++;
                trackRange(value);
            } else if (DATE_PATTERN.matcher(value).matches()) {
                dateCount++;
                numericRange = false;
            } else {
                stringCount++;
                numericRange = false;
            }
        }

        void trackRange(String value) {
            try {
                double d = Double.parseDouble(value);
                if (min == null || d < min) min = d;
                if (max == null || d > max) max = d;
            } catch (NumberFormatException ignored) {
                numericRange = false;
            }
        }

        ColumnStat toStat(String name) {
            String type = inferType();
            List<String> sample = distinct.stream().limit(MAX_SAMPLE_VALUES).toList();
            String minStr = numericRange && min != null ? formatNumber(min) : null;
            String maxStr = numericRange && max != null ? formatNumber(max) : null;
            return new ColumnStat(name, nonNull, nullCount, distinct.size(), truncated, sample, type, minStr, maxStr);
        }

        String inferType() {
            long total = intCount + floatCount + dateCount + stringCount;
            if (total == 0) return "empty";
            if (stringCount * 2 > total) return "string";
            if (dateCount * 2 > total) return "date";
            if (floatCount > 0) return "float";
            if (intCount * 2 > total) return "int";
            return "string";
        }

        String formatNumber(double d) {
            return d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(d);
        }
    }
}
