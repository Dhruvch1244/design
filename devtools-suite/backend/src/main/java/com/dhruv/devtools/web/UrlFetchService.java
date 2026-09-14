package com.dhruv.devtools.web;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Shared server-side URL fetcher, used by any tool that needs to read a response the browser
 * itself can't (cross-origin headers blocked by CORS, or a URL the frontend has no route to —
 * a YARN ResourceManager UI, an internal Jenkins link, and so on). Every call is a user-supplied
 * URL, fetched explicitly on request — never automatic, never following a chain of redirects
 * unboundedly, and capped in size and time so a slow/huge/malicious endpoint can't hang the app
 * or exhaust memory.
 */
@Service
public class UrlFetchService {

    private static final int MAX_BODY_BYTES = 2 * 1024 * 1024;
    private static final Duration TIMEOUT = Duration.ofSeconds(10);

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(TIMEOUT)
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public record FetchResult(int status, Map<String, List<String>> headers, String body, long durationMs, boolean truncated) {}

    public FetchResult fetch(String url, String method, Map<String, String> requestHeaders, String body) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url)).timeout(TIMEOUT);
        if (requestHeaders != null) {
            requestHeaders.forEach(builder::header);
        }
        HttpRequest.BodyPublisher publisher = (body == null || body.isEmpty())
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body);
        builder.method(method == null || method.isBlank() ? "GET" : method.toUpperCase(), publisher);

        long start = System.currentTimeMillis();
        HttpResponse<byte[]> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray());
        long duration = System.currentTimeMillis() - start;

        byte[] raw = response.body();
        boolean truncated = raw.length > MAX_BODY_BYTES;
        byte[] clipped = truncated ? java.util.Arrays.copyOf(raw, MAX_BODY_BYTES) : raw;

        return new FetchResult(
                response.statusCode(),
                response.headers().map(),
                new String(clipped, java.nio.charset.StandardCharsets.UTF_8),
                duration,
                truncated);
    }
}
