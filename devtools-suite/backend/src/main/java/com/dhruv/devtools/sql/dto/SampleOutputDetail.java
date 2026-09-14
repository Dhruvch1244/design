package com.dhruv.devtools.sql.dto;

import java.util.List;

public record SampleOutputDetail(List<String> columns, List<List<Object>> rows) {}
