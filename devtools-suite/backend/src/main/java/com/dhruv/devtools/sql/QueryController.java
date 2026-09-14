package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.QueryExecuteRequest;
import com.dhruv.devtools.sql.dto.QueryResult;
import com.dhruv.devtools.sql.model.QueryRun;
import com.dhruv.devtools.sql.repo.QueryRunRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sql")
public class QueryController {

    private final QueryExecutionService executionService;
    private final QueryRunRepository runRepository;

    public QueryController(QueryExecutionService executionService, QueryRunRepository runRepository) {
        this.executionService = executionService;
        this.runRepository = runRepository;
    }

    @PostMapping("/execute")
    public QueryResult execute(@RequestBody QueryExecuteRequest req) {
        return executionService.execute(req);
    }

    @GetMapping("/runs")
    public List<QueryRun> runs() {
        return runRepository.findTop100ByOrderByExecutedAtDesc();
    }

    @GetMapping("/runs/by-query/{savedQueryId}")
    public List<QueryRun> runsForQuery(@PathVariable Long savedQueryId) {
        return runRepository.findTop100BySavedQueryIdOrderByExecutedAtDesc(savedQueryId);
    }
}
