package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.ConnectionRequest;
import com.dhruv.devtools.sql.dto.ConnectionResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sql/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @GetMapping
    public List<ConnectionResponse> list() {
        return connectionService.list();
    }

    @PostMapping
    public ConnectionResponse create(@RequestBody ConnectionRequest req) {
        return connectionService.create(req);
    }

    @PutMapping("/{id}")
    public ConnectionResponse update(@PathVariable Long id, @RequestBody ConnectionRequest req) {
        return connectionService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        connectionService.delete(id);
    }

    @PostMapping("/{id}/test")
    public TestResult test(@PathVariable Long id) {
        return new TestResult(connectionService.testConnection(id));
    }

    public record TestResult(String message) {}
}
