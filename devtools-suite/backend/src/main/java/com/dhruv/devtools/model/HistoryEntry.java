package com.dhruv.devtools.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "history_entry")
public class HistoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String tool;

    @Column(length = 4000)
    private String label;

    @Lob
    private String input;

    @Lob
    private String output;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTool() { return tool; }
    public void setTool(String tool) { this.tool = tool; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
