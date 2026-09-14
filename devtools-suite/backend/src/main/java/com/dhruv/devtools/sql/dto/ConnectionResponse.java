package com.dhruv.devtools.sql.dto;

import java.time.Instant;

/** Password is never returned — hasPassword just tells the UI whether one is stored. */
public record ConnectionResponse(
        Long id,
        String name,
        String driver,
        String jdbcUrl,
        String username,
        boolean hasPassword,
        boolean readOnly,
        String colorTag,
        Instant createdAt
) {}
