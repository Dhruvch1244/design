package com.dhruv.devtools.repo;

import com.dhruv.devtools.model.HistoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoryRepository extends JpaRepository<HistoryEntry, Long> {
    List<HistoryEntry> findTop50ByToolOrderByCreatedAtDesc(String tool);
}
