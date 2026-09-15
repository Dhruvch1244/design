package com.dhruv.devtools.tasks;

import com.dhruv.devtools.tasks.model.TaskItem;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskItem> list() {
        return taskService.list();
    }

    @PostMapping
    public TaskItem create(@RequestBody TaskService.Request req) {
        return taskService.create(req);
    }

    @PutMapping("/{id}")
    public TaskItem update(@PathVariable Long id, @RequestBody TaskService.Request req) {
        return taskService.update(id, req);
    }

    @PostMapping("/{id}/start")
    public TaskItem start(@PathVariable Long id) {
        return taskService.start(id);
    }

    @PostMapping("/{id}/complete")
    public TaskItem complete(@PathVariable Long id) {
        return taskService.complete(id);
    }

    @PostMapping("/{id}/reopen")
    public TaskItem reopen(@PathVariable Long id) {
        return taskService.reopen(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }
}
