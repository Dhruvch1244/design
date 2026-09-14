package com.dhruv.devtools.notes;

import com.dhruv.devtools.notes.model.Folder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @GetMapping
    public List<Folder> list() {
        return folderService.list();
    }

    @PostMapping
    public Folder create(@RequestBody FolderService.Request req) {
        return folderService.create(req);
    }

    @PutMapping("/{id}")
    public Folder update(@PathVariable Long id, @RequestBody FolderService.Request req) {
        return folderService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        folderService.delete(id);
    }
}
