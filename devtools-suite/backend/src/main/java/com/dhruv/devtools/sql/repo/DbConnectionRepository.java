package com.dhruv.devtools.sql.repo;

import com.dhruv.devtools.sql.model.DbConnection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DbConnectionRepository extends JpaRepository<DbConnection, Long> {
}
