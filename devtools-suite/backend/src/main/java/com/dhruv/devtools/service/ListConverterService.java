package com.dhruv.devtools.service;

import com.dhruv.devtools.dto.ListConvertResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ListConverterService {

    public ListConvertResult convert(String rawInput) {
        List<String> items = rawInput.lines()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        String quoted = "(" + items.stream()
                .map(s -> "'" + s.replace("'", "\\'") + "'")
                .collect(Collectors.joining(", ")) + ")";

        String unquoted = "(" + String.join(", ", items) + ")";

        return new ListConvertResult(quoted, unquoted, items.size());
    }
}
