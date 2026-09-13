package com.dhruv.devtools.controller;

import com.dhruv.devtools.dto.FileSearchResult;
import com.dhruv.devtools.service.FileSearchService;
import com.dhruv.devtools.service.HistoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/file-search")
public class FileSearchController {

    private final FileSearchService fileSearchService;
    private final HistoryService historyService;

    public FileSearchController(FileSearchService fileSearchService, HistoryService historyService) {
        this.fileSearchService = fileSearchService;
        this.historyService = historyService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public FileSearchResult search(@RequestParam("file") MultipartFile file,
                                    @RequestParam("term") String term,
                                    @RequestParam(value = "regex", defaultValue = "false") boolean regex,
                                    @RequestParam(value = "caseSensitive", defaultValue = "false") boolean caseSensitive,
                                    @RequestParam(value = "maxSizeBytes", required = false) Long maxSizeBytes) throws IOException {
        FileSearchResult result = fileSearchService.search(file, term, regex, caseSensitive, maxSizeBytes);
        historyService.record("file-search",
                file.getOriginalFilename() + "  →  \"" + term + "\"",
                term,
                result.matchCount() + " matches in " + result.fileName());
        return result;
    }
}
