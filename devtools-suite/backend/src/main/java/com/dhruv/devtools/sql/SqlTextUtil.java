package com.dhruv.devtools.sql;

/**
 * Shared lexical helper: blanks out comments and string/quoted-identifier literals (replacing
 * their characters with spaces, preserving overall offsets) so both the read-only guard and the
 * parameter binder can scan for keywords/colons without being fooled by SQL text that happens to
 * contain a semicolon, a keyword, or a colon inside a string.
 */
final class SqlTextUtil {

    private SqlTextUtil() {}

    static String stripCommentsAndLiterals(String sql) {
        char[] out = sql.toCharArray();
        int n = out.length;
        int i = 0;
        while (i < n) {
            char c = out[i];
            if (c == '-' && i + 1 < n && out[i + 1] == '-') {
                while (i < n && out[i] != '\n') {
                    out[i] = ' ';
                    i++;
                }
            } else if (c == '/' && i + 1 < n && out[i + 1] == '*') {
                out[i] = ' ';
                out[i + 1] = ' ';
                i += 2;
                while (i + 1 < n && !(out[i] == '*' && out[i + 1] == '/')) {
                    out[i] = ' ';
                    i++;
                }
                if (i + 1 < n) {
                    out[i] = ' ';
                    out[i + 1] = ' ';
                    i += 2;
                }
            } else if (c == '\'' || c == '"') {
                char quote = c;
                out[i] = ' ';
                i++;
                while (i < n) {
                    if (out[i] == quote) {
                        if (i + 1 < n && out[i + 1] == quote) {
                            out[i] = ' ';
                            out[i + 1] = ' ';
                            i += 2;
                            continue;
                        }
                        out[i] = ' ';
                        i++;
                        break;
                    }
                    out[i] = ' ';
                    i++;
                }
            } else {
                i++;
            }
        }
        return new String(out);
    }
}
