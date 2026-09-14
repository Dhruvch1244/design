package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.QueryExecuteRequest;
import com.dhruv.devtools.sql.dto.QueryResult;
import com.dhruv.devtools.sql.model.DbConnection;
import com.dhruv.devtools.sql.model.QueryRun;
import com.dhruv.devtools.sql.repo.QueryRunRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Executes a query against a saved connection with the guardrails a local tool needs when
 * pointed at a real database: a hard row cap and statement timeout so a stray SELECT * on a
 * huge table can't hang the app, named-parameter binding that always goes through
 * PreparedStatement (never string concatenation), and a read-only check for connections marked
 * as such.
 */
@Service
public class QueryExecutionService {

    private static final int DEFAULT_MAX_ROWS = 5_000;
    private static final int DEFAULT_TIMEOUT_SECONDS = 30;
    private static final int FETCH_SIZE = 500;

    private final ConnectionService connectionService;
    private final SqlGuard sqlGuard;
    private final ParameterBinder parameterBinder;
    private final QueryRunRepository runRepository;
    private final ObjectMapper objectMapper;

    public QueryExecutionService(ConnectionService connectionService, SqlGuard sqlGuard,
                                  ParameterBinder parameterBinder, QueryRunRepository runRepository,
                                  ObjectMapper objectMapper) {
        this.connectionService = connectionService;
        this.sqlGuard = sqlGuard;
        this.parameterBinder = parameterBinder;
        this.runRepository = runRepository;
        this.objectMapper = objectMapper;
    }

    public QueryResult execute(QueryExecuteRequest req) {
        if (req.connectionId() == null) throw new IllegalArgumentException("Choose a connection");
        if (req.sql() == null || req.sql().isBlank()) throw new IllegalArgumentException("Enter a query");

        DbConnection connection = connectionService.entity(req.connectionId());
        String sql = req.explain() ? "EXPLAIN " + req.sql() : req.sql();

        if (connection.isReadOnly()) {
            sqlGuard.assertReadOnly(sql);
        }
        String statementType = sqlGuard.leadingStatementType(sql);

        ParameterBinder.Bound bound = parameterBinder.bind(sql);
        int maxRows = (req.maxRows() != null && req.maxRows() > 0) ? req.maxRows() : DEFAULT_MAX_ROWS;
        int timeoutSeconds = (req.timeoutSeconds() != null && req.timeoutSeconds() > 0) ? req.timeoutSeconds() : DEFAULT_TIMEOUT_SECONDS;

        List<String> columns = new ArrayList<>();
        List<List<Object>> rows = new ArrayList<>();
        boolean truncated = false;
        String status = "SUCCESS";
        String errorText = null;
        long start = System.currentTimeMillis();

        try (Connection c = connectionService.dataSource(req.connectionId()).getConnection();
             PreparedStatement ps = c.prepareStatement(bound.jdbcSql())) {
            ps.setFetchSize(FETCH_SIZE);
            ps.setMaxRows(maxRows + 1); // +1 lets us detect truncation without an extra count query
            ps.setQueryTimeout(timeoutSeconds);
            bindParams(ps, bound.orderedParamNames(), req.params());

            boolean hasResultSet = ps.execute();
            if (hasResultSet) {
                try (ResultSet rs = ps.getResultSet()) {
                    ResultSetMetaData meta = rs.getMetaData();
                    int colCount = meta.getColumnCount();
                    for (int i = 1; i <= colCount; i++) columns.add(meta.getColumnLabel(i));

                    int count = 0;
                    while (rs.next()) {
                        if (count >= maxRows) {
                            truncated = true;
                            break;
                        }
                        List<Object> row = new ArrayList<>(colCount);
                        for (int i = 1; i <= colCount; i++) row.add(rs.getObject(i));
                        rows.add(row);
                        count++;
                    }
                }
            } else {
                columns.add("rows_affected");
                rows.add(List.of(ps.getUpdateCount()));
            }
        } catch (SQLException e) {
            status = "ERROR";
            errorText = e.getMessage();
        }

        long durationMs = System.currentTimeMillis() - start;

        QueryRun run = new QueryRun();
        run.setSavedQueryId(req.savedQueryId());
        run.setConnectionId(req.connectionId());
        run.setSqlText(req.sql());
        run.setParamsJson(toJson(req.params()));
        run.setStatus(status);
        run.setRowCount(rows.size());
        run.setDurationMs(durationMs);
        run.setErrorText(errorText);
        run = runRepository.save(run);

        if ("ERROR".equals(status)) {
            throw new IllegalStateException(errorText);
        }

        return new QueryResult(columns, rows, rows.size(), durationMs, truncated, statementType, run.getId());
    }

    private void bindParams(PreparedStatement ps, List<String> orderedNames, Map<String, String> params) throws SQLException {
        for (int i = 0; i < orderedNames.size(); i++) {
            String raw = params == null ? null : params.get(orderedNames.get(i));
            if (raw == null) {
                ps.setNull(i + 1, Types.VARCHAR);
            } else {
                ps.setObject(i + 1, inferValue(raw));
            }
        }
    }

    private Object inferValue(String raw) {
        if (raw.equalsIgnoreCase("true") || raw.equalsIgnoreCase("false")) return Boolean.parseBoolean(raw);
        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException ignored) { /* not an integer */ }
        try {
            return Double.parseDouble(raw);
        } catch (NumberFormatException ignored) { /* not a float */ }
        return raw;
    }

    private String toJson(Map<String, String> params) {
        try {
            return objectMapper.writeValueAsString(params == null ? Map.of() : params);
        } catch (Exception e) {
            return "{}";
        }
    }
}
