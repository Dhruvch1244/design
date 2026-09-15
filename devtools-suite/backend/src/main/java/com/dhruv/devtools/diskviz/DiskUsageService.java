package com.dhruv.devtools.diskviz;

import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.util.*;

/**
 * Walks a local directory to build a size tree for the treemap visualizer. Sizes are always
 * computed for the full subtree (however deep it goes) even when the returned node tree is
 * truncated at maxDepth — so the boxes stay proportionally accurate, they just stop being
 * clickable/expandable past that depth (the frontend re-scans rooted at a deeper path instead
 * of asking the backend to materialize the whole tree in one huge response).
 */
@Service
public class DiskUsageService {

    public record Node(String name, String path, long sizeBytes, boolean directory, int childCount, List<Node> children) {}

    private static final int MAX_CHILDREN_SHOWN = 40;

    public Node scan(String rootPath, int maxDepth) {
        Path root = Path.of(rootPath);
        File file = root.toFile();
        if (!file.exists()) throw new IllegalArgumentException("'" + rootPath + "' does not exist.");
        return walk(file, Math.max(1, Math.min(maxDepth, 6)));
    }

    private Node walk(File file, int depthRemaining) {
        if (file.isFile()) {
            return new Node(file.getName(), file.getAbsolutePath(), Math.max(0, file.length()), false, 0, List.of());
        }

        File[] entries = file.listFiles();
        if (entries == null) entries = new File[0]; // permission denied or not actually readable

        List<Node> childNodes = new ArrayList<>();
        long total = 0;
        for (File entry : entries) {
            try {
                Node child = depthRemaining > 1 ? walk(entry, depthRemaining - 1) : summarize(entry);
                childNodes.add(child);
                total += child.sizeBytes();
            } catch (Exception ignored) {
                // unreadable entry (permissions, broken symlink) — skip it, don't fail the whole scan
            }
        }

        childNodes.sort(Comparator.comparingLong(Node::sizeBytes).reversed());
        int fullChildCount = childNodes.size();
        List<Node> shown = childNodes.size() > MAX_CHILDREN_SHOWN ? childNodes.subList(0, MAX_CHILDREN_SHOWN) : childNodes;

        return new Node(file.getName().isEmpty() ? file.getPath() : file.getName(), file.getAbsolutePath(), total, true, fullChildCount, shown);
    }

    /** Beyond maxDepth: still compute the real total size, just don't materialize grandchildren. */
    private Node summarize(File file) {
        if (file.isFile()) {
            return new Node(file.getName(), file.getAbsolutePath(), Math.max(0, file.length()), false, 0, List.of());
        }
        long size = directorySize(file);
        return new Node(file.getName(), file.getAbsolutePath(), size, true, 0, List.of());
    }

    private long directorySize(File dir) {
        File[] entries = dir.listFiles();
        if (entries == null) return 0;
        long total = 0;
        for (File entry : entries) {
            try {
                total += entry.isDirectory() ? directorySize(entry) : Math.max(0, entry.length());
            } catch (Exception ignored) {
                // skip unreadable entries
            }
        }
        return total;
    }
}
