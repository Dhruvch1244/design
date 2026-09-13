package com.dhruv.devtools.dto;

public record XmlFormatResult(
        boolean valid,
        String pretty,
        String error,
        String fallbackFormatted
) {}
