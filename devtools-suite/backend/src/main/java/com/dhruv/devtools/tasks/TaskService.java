package com.dhruv.devtools.tasks;

import com.dhruv.devtools.tasks.model.TaskItem;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskItemRepository repository;

    public TaskService(TaskItemRepository repository) {
        this.repository = repository;
    }

    public List<TaskItem> list() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public TaskItem get(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("No such task: " + id));
    }

    public record Request(String title, String notes) {}

    public TaskItem create(Request req) {
        if (req.title() == null || req.title().isBlank()) throw new IllegalArgumentException("Task title can't be empty.");
        TaskItem task = new TaskItem();
        task.setTitle(req.title().trim());
        task.setNotes(req.notes());
        return repository.save(task);
    }

    public TaskItem update(Long id, Request req) {
        TaskItem task = get(id);
        if (req.title() != null && !req.title().isBlank()) task.setTitle(req.title().trim());
        task.setNotes(req.notes());
        return repository.save(task);
    }

    /** First transition into IN_PROGRESS records startedAt; re-starting a done task doesn't reset it. */
    public TaskItem start(Long id) {
        TaskItem task = get(id);
        if (task.getStartedAt() == null) task.setStartedAt(Instant.now());
        task.setStatus(TaskItem.Status.IN_PROGRESS);
        task.setCompletedAt(null);
        return repository.save(task);
    }

    public TaskItem complete(Long id) {
        TaskItem task = get(id);
        if (task.getStartedAt() == null) task.setStartedAt(Instant.now());
        task.setStatus(TaskItem.Status.DONE);
        task.setCompletedAt(Instant.now());
        return repository.save(task);
    }

    public TaskItem reopen(Long id) {
        TaskItem task = get(id);
        task.setStatus(TaskItem.Status.TODO);
        task.setCompletedAt(null);
        return repository.save(task);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
