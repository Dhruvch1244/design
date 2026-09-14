package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.SavedQueryRequest;
import com.dhruv.devtools.sql.model.SavedQuery;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sql/queries")
public class SavedQueryController {

    private final SavedQueryService savedQueryService;
    private final ParameterBinder parameterBinder;

    public SavedQueryController(SavedQueryService savedQueryService, ParameterBinder parameterBinder) {
        this.savedQueryService = savedQueryService;
        this.parameterBinder = parameterBinder;
    }

    @GetMapping
    public List<SavedQuery> list() {
        return savedQueryService.list();
    }

    @GetMapping("/{id}")
    public SavedQuery get(@PathVariable Long id) {
        return savedQueryService.get(id);
    }

    @PostMapping
    public SavedQuery create(@RequestBody SavedQueryRequest req) {
        return savedQueryService.create(req);
    }

    @PutMapping("/{id}")
    public SavedQuery update(@PathVariable Long id, @RequestBody SavedQueryRequest req) {
        return savedQueryService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        savedQueryService.delete(id);
    }

    @PostMapping("/{id}/favourite")
    public SavedQuery setFavourite(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return savedQueryService.setFavourite(id, Boolean.TRUE.equals(body.get("favourite")));
    }

    /** Detects :namedParams in an arbitrary SQL string, used by the editor before saving/running. */
    @PostMapping("/detect-params")
    public Map<String, List<String>> detectParams(@RequestBody Map<String, String> body) {
        return Map.of("params", parameterBinder.detectParamNames(body.getOrDefault("sql", "")));
    }
}
