package com.dhruv.devtools.controller;

import com.dhruv.devtools.dto.*;
import com.dhruv.devtools.service.HistoryService;
import com.dhruv.devtools.service.JsonService;
import com.dhruv.devtools.service.XmlService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/format")
public class FormatController {

    private final JsonService jsonService;
    private final XmlService xmlService;
    private final HistoryService historyService;

    public FormatController(JsonService jsonService, XmlService xmlService, HistoryService historyService) {
        this.jsonService = jsonService;
        this.xmlService = xmlService;
        this.historyService = historyService;
    }

    @PostMapping("/json")
    public JsonFormatResult formatJson(@RequestBody TextRequest request) {
        JsonFormatResult result = jsonService.format(request.text());
        historyService.record("json-format", request.text(), request.text(),
                result.valid() ? result.pretty() : result.fallbackFormatted());
        return result;
    }

    @PostMapping("/xml")
    public XmlFormatResult formatXml(@RequestBody TextRequest request) {
        XmlFormatResult result = xmlService.format(request.text());
        historyService.record("xml-format", request.text(), request.text(),
                result.valid() ? result.pretty() : result.fallbackFormatted());
        return result;
    }

    @PostMapping("/json-to-string")
    public JsonStringConvertResult jsonToString(@RequestBody TextRequest request) {
        JsonStringConvertResult result = jsonService.toJsonString(request.text());
        historyService.record("json-to-string", request.text(), request.text(), result.output());
        return result;
    }

    @PostMapping("/string-to-json")
    public JsonStringConvertResult stringToJson(@RequestBody TextRequest request) {
        JsonStringConvertResult result = jsonService.fromJsonString(request.text());
        historyService.record("string-to-json", request.text(), request.text(), result.output());
        return result;
    }
}
