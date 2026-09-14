package com.dhruv.devtools.sql.repo;

import com.dhruv.devtools.sql.model.SampleOutput;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SampleOutputRepository extends JpaRepository<SampleOutput, Long> {
    List<SampleOutput> findAllBySavedQueryIdOrderByCreatedAtDesc(Long savedQueryId);
    List<SampleOutput> findTop50ByOrderByCreatedAtDesc();
}
