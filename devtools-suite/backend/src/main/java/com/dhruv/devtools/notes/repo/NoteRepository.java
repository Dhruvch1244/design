package com.dhruv.devtools.notes.repo;

import com.dhruv.devtools.notes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findAllByOrderByUpdatedAtDesc();
    List<Note> findAllByFolderIdOrderByUpdatedAtDesc(Long folderId);
}
