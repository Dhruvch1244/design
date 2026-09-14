package com.dhruv.devtools.web;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * Explains why a CORS preflight would (or wouldn't) pass, by actually issuing the OPTIONS
 * preflight and the real request server-side — the browser itself can't read cross-origin
 * response headers when CORS blocks them, which is exactly the case this tool exists to debug.
 */
@RestController
@RequestMapping("/api/web/cors-check")
public class CorsCheckController {

    private final UrlFetchService urlFetchService;

    public CorsCheckController(UrlFetchService urlFetchService) {
        this.urlFetchService = urlFetchService;
    }

    public record Request(String url, String method, String origin, String requestHeaders) {}

    public record Verdict(boolean preflightRequired, boolean wouldBeAllowed, List<String> reasons) {}

    public record Response(
            int preflightStatus, Map<String, List<String>> preflightHeaders,
            int actualStatus, Map<String, List<String>> actualHeaders,
            Verdict verdict
    ) {}

    @PostMapping
    public Response check(@RequestBody Request req) throws Exception {
        String method = (req.method() == null || req.method().isBlank()) ? "GET" : req.method().toUpperCase();
        String origin = (req.origin() == null || req.origin().isBlank()) ? "https://example.local" : req.origin();

        Map<String, String> preflightHeaders = new LinkedHashMap<>();
        preflightHeaders.put("Origin", origin);
        preflightHeaders.put("Access-Control-Request-Method", method);
        if (req.requestHeaders() != null && !req.requestHeaders().isBlank()) {
            preflightHeaders.put("Access-Control-Request-Headers", req.requestHeaders());
        }

        UrlFetchService.FetchResult preflight;
        try {
            preflight = urlFetchService.fetch(req.url(), "OPTIONS", preflightHeaders, null);
        } catch (Exception e) {
            preflight = new UrlFetchService.FetchResult(0, Map.of(), "", 0, false);
        }

        Map<String, String> actualHeaders = new LinkedHashMap<>();
        actualHeaders.put("Origin", origin);
        UrlFetchService.FetchResult actual = urlFetchService.fetch(req.url(), method, actualHeaders, null);

        Verdict verdict = evaluate(method, origin, req.requestHeaders(), preflight, actual);

        return new Response(preflight.status(), preflight.headers(), actual.status(), actual.headers(), verdict);
    }

    private Verdict evaluate(String method, String origin, String requestedHeaders,
                              UrlFetchService.FetchResult preflight, UrlFetchService.FetchResult actual) {
        List<String> reasons = new ArrayList<>();
        boolean simple = List.of("GET", "HEAD", "POST").contains(method) && (requestedHeaders == null || requestedHeaders.isBlank());
        boolean preflightRequired = !simple;

        String allowOrigin = firstHeader(actual.headers(), "access-control-allow-origin");
        boolean originOk = "*".equals(allowOrigin) || origin.equalsIgnoreCase(allowOrigin);
        if (allowOrigin == null) {
            reasons.add("Response has no Access-Control-Allow-Origin header — the browser will block this regardless of preflight.");
        } else if (!originOk) {
            reasons.add("Access-Control-Allow-Origin is '" + allowOrigin + "', which doesn't match the request origin '" + origin + "'.");
        } else {
            reasons.add("Access-Control-Allow-Origin ('" + allowOrigin + "') allows this origin.");
        }

        boolean methodOk = true;
        if (preflightRequired) {
            String allowMethods = firstHeader(preflight.headers(), "access-control-allow-methods");
            methodOk = allowMethods != null && allowMethods.toUpperCase().contains(method);
            if (allowMethods == null) {
                reasons.add("Preflight response has no Access-Control-Allow-Methods header.");
                methodOk = false;
            } else if (!methodOk) {
                reasons.add("Access-Control-Allow-Methods ('" + allowMethods + "') doesn't include " + method + ".");
            } else {
                reasons.add("Access-Control-Allow-Methods allows " + method + ".");
            }
        } else {
            reasons.add(method + " with no custom headers is a \"simple\" request — no preflight needed.");
        }

        return new Verdict(preflightRequired, originOk && methodOk, reasons);
    }

    private String firstHeader(Map<String, List<String>> headers, String name) {
        for (Map.Entry<String, List<String>> e : headers.entrySet()) {
            if (e.getKey().equalsIgnoreCase(name) && !e.getValue().isEmpty()) return e.getValue().get(0);
        }
        return null;
    }
}
