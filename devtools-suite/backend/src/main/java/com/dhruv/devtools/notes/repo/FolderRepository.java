package com.dhruv.devtools.notes.repo;

import com.dhruv.devtools.notes.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findAllByOrderByNameAsc();
}
