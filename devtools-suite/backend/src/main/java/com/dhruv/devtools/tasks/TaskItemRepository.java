package com.dhruv.devtools.tasks;

import com.dhruv.devtools.tasks.model.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findAllByOrderByCreatedAtDesc();
}
