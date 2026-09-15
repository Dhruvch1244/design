package com.dhruv.devtools.sql.dto;

import java.util.List;

public class SchemaDto {

    public record ColumnInfo(String name, String type, boolean nullable, boolean primaryKey) {}

    public record ForeignKey(String column, String referencedTable, String referencedColumn) {}

    public record TableNode(String name, String type, List<ColumnInfo> columns, List<ForeignKey> foreignKeys) {}

    public record SchemaNode(String name, List<TableNode> tables) {}

    public record SchemaResponse(List<SchemaNode> schemas) {}
}
