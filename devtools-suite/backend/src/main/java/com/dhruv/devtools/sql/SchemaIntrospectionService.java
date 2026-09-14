package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.SchemaDto.ColumnInfo;
import com.dhruv.devtools.sql.dto.SchemaDto.SchemaNode;
import com.dhruv.devtools.sql.dto.SchemaDto.SchemaResponse;
import com.dhruv.devtools.sql.dto.SchemaDto.TableNode;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Service
public class SchemaIntrospectionService {

    private final ConnectionService connectionService;

    public SchemaIntrospectionService(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    public SchemaResponse introspect(Long connectionId) {
        try (Connection c = connectionService.dataSource(connectionId).getConnection()) {
            DatabaseMetaData meta = c.getMetaData();
            Map<String, List<TableNode>> tablesBySchema = new LinkedHashMap<>();

            Set<String> primaryKeyColumns = new HashSet<>();

            try (ResultSet tables = meta.getTables(null, null, "%", new String[]{"TABLE", "VIEW"})) {
                while (tables.next()) {
                    String schema = firstNonBlank(tables.getString("TABLE_SCHEM"), tables.getString("TABLE_CAT"), "default");
                    String tableName = tables.getString("TABLE_NAME");
                    String tableType = tables.getString("TABLE_TYPE");

                    primaryKeyColumns.clear();
                    try (ResultSet pks = meta.getPrimaryKeys(null, schema, tableName)) {
                        while (pks.next()) primaryKeyColumns.add(pks.getString("COLUMN_NAME"));
                    } catch (SQLException ignored) {
                        // Some drivers (e.g. sqlite via generic schema) don't support this cleanly; skip PK marking.
                    }

                    List<ColumnInfo> columns = new ArrayList<>();
                    try (ResultSet cols = meta.getColumns(null, schema, tableName, "%")) {
                        while (cols.next()) {
                            String colName = cols.getString("COLUMN_NAME");
                            columns.add(new ColumnInfo(
                                    colName,
                                    cols.getString("TYPE_NAME"),
                                    cols.getInt("NULLABLE") == DatabaseMetaData.columnNullable,
                                    primaryKeyColumns.contains(colName)));
                        }
                    }

                    tablesBySchema.computeIfAbsent(schema, k -> new ArrayList<>())
                            .add(new TableNode(tableName, tableType, columns));
                }
            }

            List<SchemaNode> schemas = tablesBySchema.entrySet().stream()
                    .map(e -> new SchemaNode(e.getKey(), e.getValue()))
                    .sorted(Comparator.comparing(SchemaNode::name))
                    .toList();

            return new SchemaResponse(schemas);
        } catch (SQLException e) {
            throw new IllegalStateException("Schema introspection failed: " + e.getMessage(), e);
        }
    }

    private String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return "default";
    }
}
