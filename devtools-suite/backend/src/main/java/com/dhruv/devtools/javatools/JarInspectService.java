package com.dhruv.devtools.javatools;

import com.dhruv.devtools.javatools.dto.JarInspectResult.DuplicateClass;
import com.dhruv.devtools.javatools.dto.JarInspectResult.JarSummary;
import com.dhruv.devtools.javatools.dto.JarInspectResult.Response;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.jar.JarInputStream;
import java.util.jar.Manifest;
import java.util.zip.ZipEntry;

/**
 * Answers the two questions that come up constantly with a broken classpath: "what Java version
 * was this compiled for" (the class-file major version — the source of the classic "unsupported
 * class file major version" error) and "is this class defined in more than one jar" (the usual
 * root cause of a NoSuchMethodError/ClassNotFoundException that only shows up at runtime).
 */
@Service
public class JarInspectService {

    public Response inspect(List<MultipartFile> files) throws IOException {
        List<JarSummary> summaries = new ArrayList<>();
        // className -> set of jar file names it was found in, to spot duplicates across the classpath.
        Map<String, Set<String>> classLocations = new HashMap<>();

        for (MultipartFile file : files) {
            long entryCount = 0;
            long totalSize = 0;
            Map<String, String> manifestAttrs = new LinkedHashMap<>();
            Map<Integer, Long> majorVersions = new TreeMap<>();

            try (InputStream rawIn = file.getInputStream();
                 JarInputStream jarIn = new JarInputStream(rawIn)) {

                Manifest manifest = jarIn.getManifest();
                if (manifest != null) {
                    manifest.getMainAttributes().forEach((k, v) -> manifestAttrs.put(String.valueOf(k), String.valueOf(v)));
                }

                ZipEntry entry;
                while ((entry = jarIn.getNextEntry()) != null) {
                    entryCount++;
                    if (entry.isDirectory()) continue;
                    totalSize += Math.max(entry.getSize(), 0);

                    if (entry.getName().endsWith(".class")) {
                        String className = entry.getName().replace('/', '.').replaceAll("\\.class$", "");
                        classLocations.computeIfAbsent(className, k -> new LinkedHashSet<>()).add(file.getOriginalFilename());

                        Integer major = readMajorVersion(jarIn);
                        if (major != null) {
                            majorVersions.merge(major, 1L, Long::sum);
                        }
                    }
                }
            }

            summaries.add(new JarSummary(file.getOriginalFilename(), entryCount, totalSize, manifestAttrs, remapByJavaVersion(majorVersions)));
        }

        List<DuplicateClass> duplicates = classLocations.entrySet().stream()
                .filter(e -> e.getValue().size() > 1)
                .map(e -> new DuplicateClass(e.getKey(), new ArrayList<>(e.getValue())))
                .sorted(Comparator.comparing(DuplicateClass::className))
                .toList();

        return new Response(summaries, duplicates);
    }

    /** Class file layout: 4-byte magic (0xCAFEBABE), 2-byte minor version, 2-byte major version. */
    private Integer readMajorVersion(InputStream in) throws IOException {
        byte[] header = new byte[8];
        int read = in.readNBytes(header, 0, 8);
        if (read < 8) return null;
        boolean magicOk = (header[0] & 0xFF) == 0xCA && (header[1] & 0xFF) == 0xFE
                && (header[2] & 0xFF) == 0xBA && (header[3] & 0xFF) == 0xBE;
        if (!magicOk) return null;
        return ((header[6] & 0xFF) << 8) | (header[7] & 0xFF);
    }

    private Map<String, Long> remapByJavaVersion(Map<Integer, Long> majorVersions) {
        Map<String, Long> out = new LinkedHashMap<>();
        majorVersions.forEach((major, count) -> out.put(describeMajorVersion(major), count));
        return out;
    }

    private String describeMajorVersion(int major) {
        String javaVersion = major >= 56 ? String.valueOf(major - 44) : switch (major) {
            case 52 -> "8";
            case 51 -> "7";
            case 50 -> "6";
            case 49 -> "5";
            default -> "pre-5";
        };
        return "Java " + javaVersion + " (major=" + major + ")";
    }
}
