package com.dhruv.devtools.service;

import com.dhruv.devtools.dto.JsonFormatResult;
import com.dhruv.devtools.dto.JsonStringConvertResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class JsonService {

    private final ObjectMapper mapper = new ObjectMapper();

    public JsonFormatResult format(String input) {
        try {
            JsonNode node = mapper.readTree(input);
            String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
            return new JsonFormatResult(true, pretty, node, null, null);
        } catch (JsonProcessingException e) {
            String fallback = lineBreakInvalidJson(input);
            return new JsonFormatResult(false, null, null, e.getOriginalMessage(), fallback);
        }
    }

    /** Breaks unparsable JSON-ish text onto separate lines at structural characters,
     *  respecting string literals so it stays readable even when broken. */
    private String lineBreakInvalidJson(String input) {
        StringBuilder out = new StringBuilder();
        int indent = 0;
        boolean inString = false;
        boolean escaped = false;

        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);

            if (inString) {
                out.append(c);
                if (escaped) {
                    escaped = false;
                } else if (c == '\\') {
                    escaped = true;
                } else if (c == '"') {
                    inString = false;
                }
                continue;
            }

            switch (c) {
                case '"' -> {
                    inString = true;
                    out.append(c);
                }
                case '{', '[' -> {
                    out.append(c).append('\n');
                    indent++;
                    appendIndent(out, indent);
                }
                case '}', ']' -> {
                    out.append('\n');
                    indent = Math.max(0, indent - 1);
                    appendIndent(out, indent);
                    out.append(c);
                }
                case ',' -> {
                    out.append(c).append('\n');
                    appendIndent(out, indent);
                }
                case ' ', '\t', '\n', '\r' -> {
                    // collapse existing whitespace; our own newlines control layout
                }
                default -> out.append(c);
            }
        }
        return out.toString();
    }

    private void appendIndent(StringBuilder sb, int level) {
        sb.append("  ".repeat(Math.max(0, level)));
    }

    public JsonStringConvertResult toJsonString(String rawText) {
        try {
            String encoded = mapper.writeValueAsString(rawText);
            return new JsonStringConvertResult(true, encoded, null);
        } catch (JsonProcessingException e) {
            return new JsonStringConvertResult(false, null, e.getOriginalMessage());
        }
    }

    public JsonStringConvertResult fromJsonString(String quoted) {
        String candidate = quoted.trim();
        try {
            if (!candidate.startsWith("\"")) {
                candidate = "\"" + candidate.replace("\"", "\\\"") + "\"";
            }
            String decoded = mapper.readValue(candidate, String.class);
            try {
                JsonNode node = mapper.readTree(decoded);
                decoded = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
            } catch (JsonProcessingException ignored) {
                // decoded text isn't itself JSON — return as plain decoded string
            }
            return new JsonStringConvertResult(true, decoded, null);
        } catch (JsonProcessingException e) {
            return new JsonStringConvertResult(false, null, e.getOriginalMessage());
        }
    }
}
