package com.dhruv.devtools.service;

import com.dhruv.devtools.dto.FileSearchMatch;
import com.dhruv.devtools.dto.FileSearchResult;
import com.dhruv.devtools.dto.TermMatches;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.IllegalCharsetNameException;
import java.nio.charset.StandardCharsets;
import java.nio.charset.UnsupportedCharsetException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Service
public class FileSearchService {

    @Value("${devtools.file-search.max-size-bytes:42949672960}")
    private long defaultMaxSizeBytes;

    private static final int MAX_MATCHES_PER_TERM = 20_000;

    /**
     * Hard cap on how many characters of a single line we buffer, independent of file size.
     * Protects against OOM on pathological input (e.g. a multi-GB file with no newlines) —
     * bytes beyond the cap are dropped rather than accumulated, so memory use stays bounded
     * no matter how large the file or how degenerate a single "line" is.
     */
    private static final int MAX_LINE_CHARS = 1 << 20;

    private static final int READ_BUFFER_CHARS = 1 << 16;

    /** Existing entry point: file uploaded through the browser (multipart). Fine for small/ad-hoc files. */
    public FileSearchResult search(MultipartFile file, List<String> rawTerms, boolean regex,
                                    boolean caseSensitive, Long maxSizeBytesOverride) throws IOException {
        return search(file, rawTerms, regex, caseSensitive, maxSizeBytesOverride, null);
    }

    public FileSearchResult search(MultipartFile file, List<String> rawTerms, boolean regex,
                                    boolean caseSensitive, Long maxSizeBytesOverride, String charsetName) throws IOException {
        long limit = resolveLimit(maxSizeBytesOverride);
        if (file.getSize() > limit) {
            throw new IllegalArgumentException(
                    "File size " + file.getSize() + " bytes exceeds the configured maximum of " + limit + " bytes");
        }
        try (InputStream in = file.getInputStream()) {
            return scan(in, file.getSize(), file.getOriginalFilename(), rawTerms, regex, caseSensitive, charsetName);
        }
    }

    /**
     * New entry point: search a file already on local disk by path, read directly by the backend.
     * No HTTP upload, so file size is limited only by disk speed and devtools.file-search.max-size-bytes —
     * this is the mode that makes 40GB+ files practical, since a browser multipart upload of that size
     * would mean copying the whole file into a Tomcat temp file before a single byte gets scanned.
     */
    public FileSearchResult searchPath(String rawPath, List<String> rawTerms, boolean regex,
                                        boolean caseSensitive, Long maxSizeBytesOverride, String charsetName) throws IOException {
        if (rawPath == null || rawPath.isBlank()) {
            throw new IllegalArgumentException("Provide a file path");
        }
        Path path = Path.of(rawPath.trim());
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("No such file: " + path);
        }
        if (!Files.isRegularFile(path)) {
            throw new IllegalArgumentException("Not a regular file: " + path);
        }
        if (!Files.isReadable(path)) {
            throw new IllegalArgumentException("File is not readable: " + path);
        }

        long size = Files.size(path);
        long limit = resolveLimit(maxSizeBytesOverride);
        if (size > limit) {
            throw new IllegalArgumentException(
                    "File size " + size + " bytes exceeds the configured maximum of " + limit + " bytes");
        }

        try (InputStream in = Files.newInputStream(path)) {
            return scan(in, size, path.getFileName().toString(), rawTerms, regex, caseSensitive, charsetName);
        }
    }

    private long resolveLimit(Long override) {
        return (override != null && override > 0) ? override : defaultMaxSizeBytes;
    }

    private FileSearchResult scan(InputStream rawIn, long fileSize, String fileName, List<String> rawTerms,
                                   boolean regex, boolean caseSensitive, String charsetName) throws IOException {
        Set<String> terms = new LinkedHashSet<>();
        for (String t : rawTerms) {
            String trimmed = t.trim();
            if (!trimmed.isEmpty()) terms.add(trimmed);
        }
        if (terms.isEmpty()) {
            throw new IllegalArgumentException("Provide at least one search term");
        }

        List<String> termList = new ArrayList<>(terms);
        List<Pattern> patterns = new ArrayList<>();
        for (String term : termList) {
            patterns.add(buildPattern(term, regex, caseSensitive));
        }

        List<List<FileSearchMatch>> matchesPerTerm = new ArrayList<>();
        long[] countPerTerm = new long[termList.size()];
        for (int i = 0; i < termList.size(); i++) matchesPerTerm.add(new ArrayList<>());

        long[] totals = new long[2]; // [0] = totalLines, [1] = totalMatches
        Charset charset = resolveCharset(charsetName);

        Reader reader = new InputStreamReader(rawIn, charset.newDecoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE));

        try {
            scanLines(reader, (lineNumber, line) -> {
                totals[0]++;
                for (int i = 0; i < patterns.size(); i++) {
                    if (patterns.get(i).matcher(line).find()) {
                        countPerTerm[i]++;
                        totals[1]++;
                        if (matchesPerTerm.get(i).size() < MAX_MATCHES_PER_TERM) {
                            matchesPerTerm.get(i).add(new FileSearchMatch(lineNumber, line));
                        }
                    }
                }
            });
        } catch (UncheckedIOException e) {
            throw e.getCause();
        }

        List<TermMatches> termResults = new ArrayList<>();
        for (int i = 0; i < termList.size(); i++) {
            boolean truncated = countPerTerm[i] > MAX_MATCHES_PER_TERM;
            termResults.add(new TermMatches(termList.get(i), countPerTerm[i], matchesPerTerm.get(i), truncated));
        }

        return new FileSearchResult(fileName, fileSize, totals[0], totals[1], termResults);
    }

    private interface LineHandler {
        void onLine(int lineNumber, String line);
    }

    /**
     * Streams the reader in fixed-size blocks and splits on '\n', so memory use stays bounded by
     * READ_BUFFER_CHARS regardless of overall file size. Any single line is capped at MAX_LINE_CHARS —
     * characters beyond the cap are dropped rather than buffered, so a pathological file with no
     * newlines (or one absurdly long line) can't exhaust the heap. \r is stripped so CRLF and LF
     * files behave identically.
     */
    private void scanLines(Reader reader, LineHandler handler) throws IOException {
        char[] buf = new char[READ_BUFFER_CHARS];
        StringBuilder current = new StringBuilder();
        int lineNumber = 0;
        int n;
        while ((n = reader.read(buf)) != -1) {
            for (int i = 0; i < n; i++) {
                char c = buf[i];
                if (c == '\n') {
                    lineNumber++;
                    handler.onLine(lineNumber, current.toString());
                    current.setLength(0);
                } else if (c != '\r') {
                    if (current.length() < MAX_LINE_CHARS) {
                        current.append(c);
                    }
                }
            }
        }
        if (current.length() > 0) {
            lineNumber++;
            handler.onLine(lineNumber, current.toString());
        }
    }

    private Charset resolveCharset(String charsetName) {
        if (charsetName == null || charsetName.isBlank()) return StandardCharsets.UTF_8;
        try {
            return Charset.forName(charsetName.trim());
        } catch (IllegalCharsetNameException | UnsupportedCharsetException e) {
            throw new IllegalArgumentException("Unsupported charset: " + charsetName);
        }
    }

    private Pattern buildPattern(String term, boolean regex, boolean caseSensitive) {
        String source = regex ? term : Pattern.quote(term);
        int flags = caseSensitive ? 0 : Pattern.CASE_INSENSITIVE;
        try {
            return Pattern.compile(source, flags);
        } catch (PatternSyntaxException e) {
            throw new IllegalArgumentException("Invalid regex '" + term + "': " + e.getMessage());
        }
    }
}
