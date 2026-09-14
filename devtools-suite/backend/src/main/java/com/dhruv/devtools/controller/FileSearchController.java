package com.dhruv.devtools.controller;

import com.dhruv.devtools.dto.FileSearchResult;
import com.dhruv.devtools.dto.PathSearchRequest;
import com.dhruv.devtools.service.FileSearchService;
import com.dhruv.devtools.service.HistoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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
                                    @RequestParam("terms") String termsRaw,
                                    @RequestParam(value = "regex", defaultValue = "false") boolean regex,
                                    @RequestParam(value = "caseSensitive", defaultValue = "false") boolean caseSensitive,
                                    @RequestParam(value = "maxSizeBytes", required = false) Long maxSizeBytes,
                                    @RequestParam(value = "charset", required = false) String charset) throws IOException {
        List<String> terms = termsRaw.lines().toList();
        FileSearchResult result = fileSearchService.search(file, terms, regex, caseSensitive, maxSizeBytes, charset);
        historyService.record("file-search",
                file.getOriginalFilename() + "  →  " + String.join(", ", terms),
                termsRaw,
                result.totalMatches() + " matches across " + result.termResults().size() + " term(s) in " + result.fileName());
        return result;
    }

    /**
     * Search a file that already lives on local disk, read directly by the backend — no upload.
     * This is the mode that scales to 40GB+: the browser-upload endpoint above copies the whole
     * file into a Tomcat temp file first, which is impractical much past a few hundred MB.
     */
    @PostMapping(value = "/path", consumes = "application/json")
    public FileSearchResult searchPath(@RequestBody PathSearchRequest request) throws IOException {
        List<String> terms = request.terms() == null ? List.of() : request.terms();
        FileSearchResult result = fileSearchService.searchPath(
                request.path(), terms, request.regex(), request.caseSensitive(),
                request.maxSizeBytes(), request.charset());
        historyService.record("file-search",
                request.path() + "  →  " + String.join(", ", terms),
                request.path() + "\n" + String.join("\n", terms),
                result.totalMatches() + " matches across " + result.termResults().size() + " term(s) in " + result.fileName());
        return result;
    }
}
