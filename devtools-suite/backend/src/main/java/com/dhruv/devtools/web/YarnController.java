package com.dhruv.devtools.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Live YARN mode: queries the ResourceManager REST API server-side (same UrlFetchService the
 * CORS checker uses), since the RM UI is almost always on an internal network the browser can't
 * reach directly, and its JSON API doesn't set CORS headers for arbitrary origins anyway.
 */
@RestController
@RequestMapping("/api/web/yarn-app")
public class YarnController {

    private final UrlFetchService urlFetchService;
    private final ObjectMapper objectMapper;

    public YarnController(UrlFetchService urlFetchService, ObjectMapper objectMapper) {
        this.urlFetchService = urlFetchService;
        this.objectMapper = objectMapper;
    }

    public record Request(String rmBaseUrl, String applicationId) {}

    @PostMapping
    public Map<String, Object> fetchApp(@RequestBody Request req) throws Exception {
        String base = req.rmBaseUrl().replaceAll("/+$", "");
        String url = base + "/ws/v1/cluster/apps/" + req.applicationId();

        UrlFetchService.FetchResult result = urlFetchService.fetch(url, "GET", Map.of("Accept", "application/json"), null);
        if (result.status() != 200) {
            throw new IllegalArgumentException("ResourceManager returned HTTP " + result.status() + ": " + result.body());
        }

        Map<String, Object> parsed = objectMapper.readValue(result.body(), Map.class);
        Object app = parsed.get("app");
        if (app == null) {
            throw new IllegalArgumentException("Response had no \"app\" field — is this really a YARN RM apps endpoint?");
        }
        return (Map<String, Object>) app;
    }
}
