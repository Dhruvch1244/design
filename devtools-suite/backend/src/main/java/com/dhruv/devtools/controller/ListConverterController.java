package com.dhruv.devtools.controller;

import com.dhruv.devtools.dto.ListConvertResult;
import com.dhruv.devtools.dto.TextRequest;
import com.dhruv.devtools.service.HistoryService;
import com.dhruv.devtools.service.ListConverterService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/list-convert")
public class ListConverterController {

    private final ListConverterService listConverterService;
    private final HistoryService historyService;

    public ListConverterController(ListConverterService listConverterService, HistoryService historyService) {
        this.listConverterService = listConverterService;
        this.historyService = historyService;
    }

    @PostMapping
    public ListConvertResult convert(@RequestBody TextRequest request) {
        ListConvertResult result = listConverterService.convert(request.text());
        historyService.record("list-convert", request.text(), request.text(), result.quoted());
        return result;
    }
}
