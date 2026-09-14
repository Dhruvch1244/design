package com.dhruv.devtools.common.storage;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/**
 * Stores large payloads (sample outputs, exports) as gzip files under the workspace root instead
 * of in the H2 database, so a 50k-row sample costs a few hundred KB on disk and zero DB bloat.
 */
@Component
public class BlobStore {

    private final WorkspaceRoot workspaceRoot;

    public BlobStore(WorkspaceRoot workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        try {
            Files.createDirectories(workspaceRoot.resolve("blobs/samples"));
            Files.createDirectories(workspaceRoot.resolve("blobs/exports"));
        } catch (IOException e) {
            throw new IllegalStateException("Could not create blob directories", e);
        }
    }

    /** Writes gzip-compressed content under blobs/&lt;category&gt;/&lt;uuid&gt;.gz and returns the relative path. */
    public String writeGzip(String category, byte[] content) throws IOException {
        String relative = "blobs/" + category + "/" + UUID.randomUUID() + ".gz";
        Path target = workspaceRoot.resolve(relative);
        try (OutputStream out = Files.newOutputStream(target);
             GZIPOutputStream gzip = new GZIPOutputStream(out)) {
            gzip.write(content);
        }
        return relative;
    }

    public byte[] readGzip(String relativePath) throws IOException {
        Path source = workspaceRoot.resolve(relativePath);
        try (InputStream in = Files.newInputStream(source);
             GZIPInputStream gzip = new GZIPInputStream(in)) {
            return gzip.readAllBytes();
        }
    }

    public void delete(String relativePath) throws IOException {
        Files.deleteIfExists(workspaceRoot.resolve(relativePath));
    }

    public long sizeOnDisk(String relativePath) throws IOException {
        return Files.size(workspaceRoot.resolve(relativePath));
    }
}
