package com.dhruv.devtools.notes;

import com.dhruv.devtools.notes.model.Note;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<Note> list(@RequestParam(required = false) Long folderId) {
        return noteService.list(folderId);
    }

    @GetMapping("/search")
    public List<Note> search(@RequestParam String q) {
        return noteService.search(q);
    }

    @GetMapping("/{id}")
    public Note get(@PathVariable Long id) {
        return noteService.get(id);
    }

    @GetMapping("/{id}/backlinks")
    public List<Note> backlinks(@PathVariable Long id) {
        return noteService.backlinksTo(noteService.get(id));
    }

    @PostMapping
    public Note create(@RequestBody NoteService.Request req) {
        return noteService.create(req);
    }

    @PutMapping("/{id}")
    public Note update(@PathVariable Long id, @RequestBody NoteService.Request req) {
        return noteService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        noteService.delete(id);
    }

    @PostMapping("/{id}/favourite")
    public Note setFavourite(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return noteService.setFavourite(id, Boolean.TRUE.equals(body.get("favourite")));
    }
}
