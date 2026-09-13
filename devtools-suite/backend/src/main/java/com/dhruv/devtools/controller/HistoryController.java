package com.dhruv.devtools.controller;

import com.dhruv.devtools.model.HistoryEntry;
import com.dhruv.devtools.service.HistoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping("/{tool}")
    public List<HistoryEntry> recent(@PathVariable String tool) {
        return historyService.recent(tool);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        historyService.delete(id);
    }
}
