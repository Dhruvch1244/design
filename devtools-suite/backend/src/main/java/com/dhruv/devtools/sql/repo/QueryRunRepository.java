package com.dhruv.devtools.sql.repo;

import com.dhruv.devtools.sql.model.QueryRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QueryRunRepository extends JpaRepository<QueryRun, Long> {
    List<QueryRun> findTop100ByOrderByExecutedAtDesc();
    List<QueryRun> findTop100BySavedQueryIdOrderByExecutedAtDesc(Long savedQueryId);
}
