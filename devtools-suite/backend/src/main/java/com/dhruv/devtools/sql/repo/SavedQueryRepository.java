package com.dhruv.devtools.sql.repo;

import com.dhruv.devtools.sql.model.SavedQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedQueryRepository extends JpaRepository<SavedQuery, Long> {
    List<SavedQuery> findAllByOrderByUpdatedAtDesc();
}
