package com.dhruv.devtools.springviz;

import com.dhruv.devtools.springviz.dto.SpringVizResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/springviz")
public class SpringVizController {

    private final SpringVizService service;

    public SpringVizController(SpringVizService service) {
        this.service = service;
    }

    public record Request(String path) {}

    @PostMapping("/analyze")
    public SpringVizResult.Response analyze(@RequestBody Request req) {
        if (req.path() == null || req.path().isBlank()) {
            throw new IllegalArgumentException("Give me a folder path to a Spring Boot project's source root.");
        }
        return service.analyze(req.path().trim());
    }
}
