package com.dhruv.devtools.dto;

import java.util.List;

public record TermMatches(String term, long matchCount, List<FileSearchMatch> matches, boolean truncated) {}
