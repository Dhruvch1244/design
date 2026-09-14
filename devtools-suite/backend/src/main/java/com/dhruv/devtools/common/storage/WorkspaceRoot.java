package com.dhruv.devtools.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Single directory everything the suite writes to disk lives under (blobs, keys, exports),
 * separate from the working directory the jar happens to be launched from.
 */
@Component
public class WorkspaceRoot {

    private final Path root;

    public WorkspaceRoot(@Value("${devtools.workspace-dir:${user.home}/devtools-workspace}") String dir) {
        this.root = Path.of(dir);
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create workspace directory: " + root, e);
        }
    }

    public Path path() {
        return root;
    }

    public Path resolve(String relative) {
        Path resolved = root.resolve(relative).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Path escapes workspace root: " + relative);
        }
        return resolved;
    }
}
