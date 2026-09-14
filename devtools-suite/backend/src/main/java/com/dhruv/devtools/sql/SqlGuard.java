package com.dhruv.devtools.sql;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rejects write statements on read-only connections. Works by blanking out comments and string
 * literals first (SqlTextUtil), then checking each ';'-separated statement's leading keyword and
 * scanning its remaining tokens for write keywords — so "WITH x AS (...) DELETE ..." is caught
 * even though the statement starts with WITH, and a literal containing the word "DROP" inside a
 * string is not.
 *
 * This is a heuristic guard, not a full SQL parser. It is deliberately conservative: anything it
 * can't confidently classify as read-only is rejected rather than allowed through.
 */
@Component
public class SqlGuard {

    private static final Set<String> READONLY_LEADING = Set.of(
            "SELECT", "WITH", "EXPLAIN", "SHOW", "DESCRIBE", "DESC", "VALUES", "TABLE");

    private static final Set<String> WRITE_KEYWORDS = Set.of(
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "GRANT", "REVOKE",
            "MERGE", "CALL", "EXEC", "EXECUTE", "REPLACE", "RENAME", "LOCK", "VACUUM", "COPY",
            "SET", "REINDEX", "ATTACH", "DETACH", "PRAGMA");

    private static final Pattern WORD = Pattern.compile("[A-Za-z_][A-Za-z0-9_]*");

    /** First keyword of the first statement — used to label runs/history (SELECT, INSERT, etc). */
    public String leadingStatementType(String sql) {
        String scan = SqlTextUtil.stripCommentsAndLiterals(sql);
        for (String statement : scan.split(";", -1)) {
            Matcher m = WORD.matcher(statement);
            if (m.find()) {
                return m.group().toUpperCase();
            }
        }
        return "UNKNOWN";
    }

    /** Throws IllegalArgumentException if the SQL contains anything that is not read-only. */
    public void assertReadOnly(String sql) {
        String scan = SqlTextUtil.stripCommentsAndLiterals(sql);
        for (String statement : scan.split(";", -1)) {
            List<String> tokens = tokens(statement);
            if (tokens.isEmpty()) continue;

            String leading = tokens.get(0).toUpperCase();
            if (!READONLY_LEADING.contains(leading)) {
                throw new IllegalArgumentException(
                        "This connection is read-only. Statement starting with '" + leading
                                + "' is not permitted (allowed: SELECT, WITH, EXPLAIN, SHOW, DESCRIBE, VALUES).");
            }
            for (String token : tokens) {
                String upper = token.toUpperCase();
                if (WRITE_KEYWORDS.contains(upper)) {
                    throw new IllegalArgumentException(
                            "This connection is read-only. Statement contains disallowed keyword '" + upper + "'.");
                }
            }
        }
    }

    private List<String> tokens(String statement) {
        Matcher m = WORD.matcher(statement);
        List<String> tokens = new java.util.ArrayList<>();
        while (m.find()) tokens.add(m.group());
        return tokens;
    }
}
