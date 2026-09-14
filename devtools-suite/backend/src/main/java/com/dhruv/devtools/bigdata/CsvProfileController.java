package com.dhruv.devtools.bigdata;

import com.dhruv.devtools.bigdata.dto.CsvProfileResult.Response;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/bigdata/csv-profile")
public class CsvProfileController {

    private final CsvProfileService csvProfileService;

    public CsvProfileController(CsvProfileService csvProfileService) {
        this.csvProfileService = csvProfileService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public Response profileUpload(@RequestParam("file") MultipartFile file,
                                   @RequestParam(value = "delimiter", defaultValue = ",") String delimiter,
                                   @RequestParam(value = "hasHeader", defaultValue = "true") boolean hasHeader) throws IOException {
        try (var in = file.getInputStream()) {
            return csvProfileService.profile(in, delimiter.charAt(0), hasHeader);
        }
    }

    public record PathRequest(String path, String delimiter, boolean hasHeader) {}

    @PostMapping(value = "/path", consumes = "application/json")
    public Response profilePath(@RequestBody PathRequest req) throws IOException {
        String delimiter = (req.delimiter() == null || req.delimiter().isEmpty()) ? "," : req.delimiter();
        return csvProfileService.profilePath(req.path(), delimiter, req.hasHeader());
    }
}
