package com.dhruv.devtools.sql.dto;

/** password: null = leave unchanged (on update), "" = clear stored password, otherwise = set/replace. */
public record ConnectionRequest(
        String name,
        String driver,
        String jdbcUrl,
        String username,
        String password,
        boolean readOnly,
        String colorTag
) {}
