package com.dhruv.devtools.bigdata;

import com.dhruv.devtools.bigdata.dto.PartMergeResult;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.zip.GZIPInputStream;

/**
 * Streams every part-file in a Hadoop/Spark output directory into one combined file — pure
 * sequential I/O, so this scales to hundreds of GB the same way File Search's path mode does:
 * nothing is ever held in memory beyond a single copy buffer.
 */
@Service
public class PartFileMergeService {

    private static final int BUFFER_SIZE = 1 << 16;

    public PartMergeResult merge(String directoryPath, String globPattern, String outputPath,
                                  boolean skipHeaderAfterFirst, boolean decompressGzip) throws IOException {
        Path dir = Path.of(directoryPath.trim());
        if (!Files.isDirectory(dir)) throw new IllegalArgumentException("Not a directory: " + dir);

        Path output = Path.of(outputPath.trim());
        if (Files.exists(output)) throw new IllegalArgumentException("Output file already exists: " + output + " — choose a new name");
        if (output.getParent() != null) Files.createDirectories(output.getParent());

        List<Path> matched = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir, globPattern.isBlank() ? "*" : globPattern)) {
            for (Path p : stream) {
                if (Files.isRegularFile(p)) matched.add(p);
            }
        }
        matched.sort(Comparator.comparing(p -> p.getFileName().toString()));
        if (matched.isEmpty()) {
            throw new IllegalArgumentException("No files in " + dir + " matched pattern '" + globPattern + "'");
        }

        long totalBytes = 0;
        List<String> mergedNames = new ArrayList<>();
        byte[] buffer = new byte[BUFFER_SIZE];

        try (OutputStream out = Files.newOutputStream(output)) {
            for (int i = 0; i < matched.size(); i++) {
                Path part = matched.get(i);
                boolean gzip = decompressGzip && part.getFileName().toString().endsWith(".gz");

                try (InputStream raw = Files.newInputStream(part);
                     InputStream in = gzip ? new GZIPInputStream(raw) : raw) {

                    InputStream effective = in;
                    if (skipHeaderAfterFirst && i > 0) {
                        skipFirstLine(effective);
                    }

                    int read;
                    while ((read = effective.read(buffer)) != -1) {
                        out.write(buffer, 0, read);
                        totalBytes += read;
                    }
                }
                mergedNames.add(part.getFileName().toString());
            }
        }

        return new PartMergeResult(output.toString(), matched.size(), totalBytes, mergedNames);
    }

    /** Consumes bytes up to and including the first '\n' (or EOF) without buffering the line itself. */
    private void skipFirstLine(InputStream in) throws IOException {
        int b;
        while ((b = in.read()) != -1) {
            if (b == '\n') break;
        }
    }
}
