package com.dhruv.devtools.sql;

import com.dhruv.devtools.common.storage.BlobStore;
import com.dhruv.devtools.sql.dto.SampleOutputDetail;
import com.dhruv.devtools.sql.dto.SampleOutputRequest;
import com.dhruv.devtools.sql.model.SampleOutput;
import com.dhruv.devtools.sql.repo.SampleOutputRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Stores a chosen result set as newline-delimited JSON, gzipped to disk via BlobStore — the
 * database only holds the pointer, column list, and size, so saving a 50k-row sample costs a
 * few hundred KB on disk and adds nothing to the H2 file. Columns marked for redaction are
 * masked before a single byte is written, since a stored sample is otherwise a plaintext copy
 * of whatever the query returned.
 */
@Service
public class SampleOutputService {

    private static final String REDACTED = "██████";

    private final SampleOutputRepository repository;
    private final BlobStore blobStore;
    private final ObjectMapper objectMapper;

    public SampleOutputService(SampleOutputRepository repository, BlobStore blobStore, ObjectMapper objectMapper) {
        this.repository = repository;
        this.blobStore = blobStore;
        this.objectMapper = objectMapper;
    }

    public SampleOutput save(SampleOutputRequest req) throws IOException {
        List<String> columns = req.columns() == null ? List.of() : req.columns();
        List<List<Object>> rows = req.rows() == null ? List.of() : req.rows();
        Set<String> redact = req.redactColumns() == null ? Set.of() : new HashSet<>(req.redactColumns());

        StringBuilder ndjson = new StringBuilder();
        for (List<Object> row : rows) {
            Map<String, Object> obj = new LinkedHashMap<>();
            for (int i = 0; i < columns.size() && i < row.size(); i++) {
                String col = columns.get(i);
                obj.put(col, redact.contains(col) ? REDACTED : row.get(i));
            }
            ndjson.append(toJson(obj)).append('\n');
        }

        String blobPath = blobStore.writeGzip("samples", ndjson.toString().getBytes(StandardCharsets.UTF_8));

        SampleOutput entity = new SampleOutput();
        entity.setQueryRunId(req.queryRunId());
        entity.setSavedQueryId(req.savedQueryId());
        entity.setLabel(req.label());
        entity.setRowCount(rows.size());
        entity.setColumnsJson(toJson(columns));
        entity.setBlobPath(blobPath);
        entity.setSizeBytes(blobStore.sizeOnDisk(blobPath));
        return repository.save(entity);
    }

    public List<SampleOutput> forSavedQuery(Long savedQueryId) {
        return repository.findAllBySavedQueryIdOrderByCreatedAtDesc(savedQueryId);
    }

    public List<SampleOutput> recent() {
        return repository.findTop50ByOrderByCreatedAtDesc();
    }

    public SampleOutputDetail read(Long id) throws IOException {
        SampleOutput entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No such sample: " + id));
        byte[] bytes = blobStore.readGzip(entity.getBlobPath());
        List<String> columns = fromJson(entity.getColumnsJson(), new TypeReference<>() {});

        List<List<Object>> rows = new ArrayList<>();
        String content = new String(bytes, StandardCharsets.UTF_8);
        for (String line : content.split("\n")) {
            if (line.isBlank()) continue;
            Map<String, Object> obj = fromJson(line, new TypeReference<>() {});
            List<Object> row = new ArrayList<>(columns.size());
            for (String col : columns) row.add(obj.get(col));
            rows.add(row);
        }
        return new SampleOutputDetail(columns, rows);
    }

    public void delete(Long id) throws IOException {
        SampleOutput entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No such sample: " + id));
        blobStore.delete(entity.getBlobPath());
        repository.deleteById(id);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialise sample output", e);
        }
    }

    private <T> T fromJson(String json, TypeReference<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to read stored sample output", e);
        }
    }
}
