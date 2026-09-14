package com.dhruv.devtools.sql.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sample_output")
public class SampleOutput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long queryRunId;

    private Long savedQueryId;

    @Column(nullable = false, length = 200)
    private String label;

    /** ndjson-gz today; kept open for future formats. */
    @Column(nullable = false, length = 20)
    private String format = "ndjson-gz";

    private long rowCount;

    @Lob
    @Column(nullable = false)
    private String columnsJson;

    @Column(nullable = false, length = 300)
    private String blobPath;

    private long sizeBytes;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQueryRunId() { return queryRunId; }
    public void setQueryRunId(Long queryRunId) { this.queryRunId = queryRunId; }
    public Long getSavedQueryId() { return savedQueryId; }
    public void setSavedQueryId(Long savedQueryId) { this.savedQueryId = savedQueryId; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public long getRowCount() { return rowCount; }
    public void setRowCount(long rowCount) { this.rowCount = rowCount; }
    public String getColumnsJson() { return columnsJson; }
    public void setColumnsJson(String columnsJson) { this.columnsJson = columnsJson; }
    public String getBlobPath() { return blobPath; }
    public void setBlobPath(String blobPath) { this.blobPath = blobPath; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
