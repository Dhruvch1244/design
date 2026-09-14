package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.SampleOutputDetail;
import com.dhruv.devtools.sql.dto.SampleOutputRequest;
import com.dhruv.devtools.sql.model.SampleOutput;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/sql/samples")
public class SampleOutputController {

    private final SampleOutputService sampleOutputService;

    public SampleOutputController(SampleOutputService sampleOutputService) {
        this.sampleOutputService = sampleOutputService;
    }

    @PostMapping
    public SampleOutput save(@RequestBody SampleOutputRequest req) throws IOException {
        return sampleOutputService.save(req);
    }

    @GetMapping
    public List<SampleOutput> recent() {
        return sampleOutputService.recent();
    }

    @GetMapping("/by-query/{savedQueryId}")
    public List<SampleOutput> forSavedQuery(@PathVariable Long savedQueryId) {
        return sampleOutputService.forSavedQuery(savedQueryId);
    }

    @GetMapping("/{id}")
    public SampleOutputDetail read(@PathVariable Long id) throws IOException {
        return sampleOutputService.read(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) throws IOException {
        sampleOutputService.delete(id);
    }
}
