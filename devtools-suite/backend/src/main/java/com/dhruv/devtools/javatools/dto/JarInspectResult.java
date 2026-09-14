package com.dhruv.devtools.javatools.dto;

import java.util.List;
import java.util.Map;

public class JarInspectResult {

    public record JarSummary(
            String fileName,
            long entryCount,
            long totalUncompressedSize,
            Map<String, String> manifestMainAttributes,
            Map<String, Long> classMajorVersions
    ) {}

    public record DuplicateClass(String className, List<String> foundInJars) {}

    public record Response(List<JarSummary> jars, List<DuplicateClass> duplicateClasses) {}
}
