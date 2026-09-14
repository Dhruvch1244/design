package com.dhruv.devtools.bigdata;

import com.dhruv.devtools.bigdata.dto.PartMergeResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/bigdata/merge-parts")
public class PartFileMergeController {

    private final PartFileMergeService partFileMergeService;

    public PartFileMergeController(PartFileMergeService partFileMergeService) {
        this.partFileMergeService = partFileMergeService;
    }

    public record Request(String directory, String globPattern, String outputPath, boolean skipHeaderAfterFirst, boolean decompressGzip) {}

    @PostMapping
    public PartMergeResult merge(@RequestBody Request req) throws IOException {
        return partFileMergeService.merge(req.directory(), req.globPattern(), req.outputPath(), req.skipHeaderAfterFirst(), req.decompressGzip());
    }
}
