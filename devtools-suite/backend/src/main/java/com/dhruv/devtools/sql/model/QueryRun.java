package com.dhruv.devtools.sql.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "query_run")
public class QueryRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long savedQueryId;

    private Long connectionId;

    @Lob
    @Column(nullable = false)
    private String sqlText;

    @Lob
    private String paramsJson;

    /** SUCCESS | ERROR */
    @Column(nullable = false, length = 20)
    private String status;

    private long rowCount;

    private long durationMs;

    @Column(length = 2000)
    private String errorText;

    @Column(nullable = false)
    private Instant executedAt;

    @PrePersist
    void onCreate() {
        if (executedAt == null) executedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSavedQueryId() { return savedQueryId; }
    public void setSavedQueryId(Long savedQueryId) { this.savedQueryId = savedQueryId; }
    public Long getConnectionId() { return connectionId; }
    public void setConnectionId(Long connectionId) { this.connectionId = connectionId; }
    public String getSqlText() { return sqlText; }
    public void setSqlText(String sqlText) { this.sqlText = sqlText; }
    public String getParamsJson() { return paramsJson; }
    public void setParamsJson(String paramsJson) { this.paramsJson = paramsJson; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getRowCount() { return rowCount; }
    public void setRowCount(long rowCount) { this.rowCount = rowCount; }
    public long getDurationMs() { return durationMs; }
    public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
    public String getErrorText() { return errorText; }
    public void setErrorText(String errorText) { this.errorText = errorText; }
    public Instant getExecutedAt() { return executedAt; }
    public void setExecutedAt(Instant executedAt) { this.executedAt = executedAt; }
}
