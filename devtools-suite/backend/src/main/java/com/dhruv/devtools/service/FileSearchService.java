package com.dhruv.devtools.service;

import com.dhruv.devtools.dto.FileSearchMatch;
import com.dhruv.devtools.dto.FileSearchResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Service
public class FileSearchService {

    @Value("${devtools.file-search.max-size-bytes:209715200}")
    private long defaultMaxSizeBytes;

    private static final int MAX_MATCHES = 20_000;

    public FileSearchResult search(MultipartFile file, String term, boolean regex,
                                    boolean caseSensitive, Long maxSizeBytesOverride) throws IOException {
        long limit = (maxSizeBytesOverride != null && maxSizeBytesOverride > 0)
                ? maxSizeBytesOverride
                : defaultMaxSizeBytes;

        if (file.getSize() > limit) {
            throw new IllegalArgumentException(
                    "File size " + file.getSize() + " bytes exceeds the configured maximum of " + limit + " bytes");
        }
        if (term == null || term.isEmpty()) {
            throw new IllegalArgumentException("Search term must not be empty");
        }

        Pattern pattern = buildPattern(term, regex, caseSensitive);

        List<FileSearchMatch> matches = new ArrayList<>();
        long totalLines = 0;
        long matchCount = 0;
        boolean truncated = false;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8), 1 << 16)) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                totalLines++;
                if (pattern.matcher(line).find()) {
                    matchCount++;
                    if (matches.size() < MAX_MATCHES) {
                        matches.add(new FileSearchMatch(lineNumber, line));
                    } else {
                        truncated = true;
                    }
                }
            }
        }

        return new FileSearchResult(file.getOriginalFilename(), file.getSize(), totalLines, matchCount, matches, truncated);
    }

    private Pattern buildPattern(String term, boolean regex, boolean caseSensitive) {
        String source = regex ? term : Pattern.quote(term);
        int flags = caseSensitive ? 0 : Pattern.CASE_INSENSITIVE;
        try {
            return Pattern.compile(source, flags);
        } catch (PatternSyntaxException e) {
            throw new IllegalArgumentException("Invalid regex: " + e.getMessage());
        }
    }
}
