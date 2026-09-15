package com.dhruv.devtools.diskviz;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/diskviz")
public class DiskUsageController {

    private final DiskUsageService service;

    public DiskUsageController(DiskUsageService service) {
        this.service = service;
    }

    public record Request(String path, Integer maxDepth) {}

    @PostMapping("/scan")
    public DiskUsageService.Node scan(@RequestBody Request req) {
        if (req.path() == null || req.path().isBlank()) {
            throw new IllegalArgumentException("Give me a folder path to scan.");
        }
        return service.scan(req.path().trim(), req.maxDepth() != null ? req.maxDepth() : 2);
    }
}
