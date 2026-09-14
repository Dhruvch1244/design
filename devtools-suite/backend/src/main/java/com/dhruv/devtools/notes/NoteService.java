package com.dhruv.devtools.notes;

import com.dhruv.devtools.notes.model.Note;
import com.dhruv.devtools.notes.repo.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NoteService {

    private static final Pattern WIKI_LINK = Pattern.compile("\\[\\[([^\\]]+)]]");

    private final NoteRepository repository;

    public NoteService(NoteRepository repository) {
        this.repository = repository;
    }

    public List<Note> list(Long folderId) {
        return folderId == null ? repository.findAllByOrderByUpdatedAtDesc() : repository.findAllByFolderIdOrderByUpdatedAtDesc(folderId);
    }

    public List<Note> all() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    public Note get(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("No such note: " + id));
    }

    public record Request(Long folderId, String title, String body, String tags, boolean favourite) {}

    public Note create(Request req) {
        Note note = new Note();
        apply(note, req);
        return repository.save(note);
    }

    public Note update(Long id, Request req) {
        Note note = get(id);
        apply(note, req);
        return repository.save(note);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Note setFavourite(Long id, boolean favourite) {
        Note note = get(id);
        note.setFavourite(favourite);
        return repository.save(note);
    }

    /** Every other note whose body contains a [[Title]] link matching this note's title. */
    public List<Note> backlinksTo(Note target) {
        return repository.findAll().stream()
                .filter(n -> !n.getId().equals(target.getId()))
                .filter(n -> {
                    Matcher m = WIKI_LINK.matcher(n.getBody());
                    while (m.find()) {
                        if (m.group(1).trim().equalsIgnoreCase(target.getTitle().trim())) return true;
                    }
                    return false;
                })
                .toList();
    }

    public List<Note> search(String query) {
        String q = query.toLowerCase();
        return repository.findAll().stream()
                .filter(n -> n.getTitle().toLowerCase().contains(q) || n.getBody().toLowerCase().contains(q)
                        || (n.getTags() != null && n.getTags().toLowerCase().contains(q)))
                .toList();
    }

    private void apply(Note note, Request req) {
        note.setFolderId(req.folderId());
        note.setTitle(req.title());
        note.setBody(req.body());
        note.setTags(req.tags());
        note.setFavourite(req.favourite());
    }
}
