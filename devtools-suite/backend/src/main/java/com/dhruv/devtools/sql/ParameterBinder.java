package com.dhruv.devtools.sql;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rewrites named parameters (":status") into JDBC placeholders ("?") and returns them in
 * appearance order for PreparedStatement binding. Parameters are always bound via
 * PreparedStatement.setObject — never string-concatenated into the SQL text — so a saved query
 * with parameters can't be turned into an injection vector by whatever a user types into the
 * parameter fields.
 *
 * Colons inside comments/strings are ignored (via SqlTextUtil), and "::" (Postgres cast syntax,
 * e.g. "col::text") is never mistaken for a parameter.
 */
@Component
public class ParameterBinder {

    private static final Pattern PARAM = Pattern.compile("(?<!:):(?!:)([A-Za-z_][A-Za-z0-9_]*)");

    public record Bound(String jdbcSql, List<String> orderedParamNames) {}

    public List<String> detectParamNames(String sql) {
        String scan = SqlTextUtil.stripCommentsAndLiterals(sql);
        Matcher m = PARAM.matcher(scan);
        LinkedHashSet<String> names = new LinkedHashSet<>();
        while (m.find()) names.add(m.group(1));
        return new ArrayList<>(names);
    }

    public Bound bind(String sql) {
        String scan = SqlTextUtil.stripCommentsAndLiterals(sql);
        Matcher m = PARAM.matcher(scan);
        StringBuilder jdbc = new StringBuilder();
        List<String> names = new ArrayList<>();
        int last = 0;
        while (m.find()) {
            names.add(m.group(1));
            jdbc.append(sql, last, m.start()).append('?');
            last = m.end();
        }
        jdbc.append(sql, last, sql.length());
        return new Bound(jdbc.toString(), names);
    }
}
