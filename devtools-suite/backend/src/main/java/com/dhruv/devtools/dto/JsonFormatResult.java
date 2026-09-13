package com.dhruv.devtools.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record JsonFormatResult(
        boolean valid,
        String pretty,
        JsonNode data,
        String error,
        String fallbackFormatted
) {}
