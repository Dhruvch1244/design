package com.dhruv.devtools.service;

import com.dhruv.devtools.model.HistoryEntry;
import com.dhruv.devtools.repo.HistoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HistoryService {

    private final HistoryRepository repository;

    public HistoryService(HistoryRepository repository) {
        this.repository = repository;
    }

    public HistoryEntry record(String tool, String label, String input, String output) {
        HistoryEntry entry = new HistoryEntry();
        entry.setTool(tool);
        entry.setLabel(truncate(label, 200));
        entry.setInput(input);
        entry.setOutput(output);
        return repository.save(entry);
    }

    public List<HistoryEntry> recent(String tool) {
        return repository.findTop50ByToolOrderByCreatedAtDesc(tool);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max);
    }
}
