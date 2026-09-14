package com.dhruv.devtools.notes;

import com.dhruv.devtools.notes.model.Folder;
import com.dhruv.devtools.notes.repo.FolderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FolderService {

    private final FolderRepository repository;

    public FolderService(FolderRepository repository) {
        this.repository = repository;
    }

    public List<Folder> list() {
        return repository.findAllByOrderByNameAsc();
    }

    public record Request(Long parentId, String name, String colorTag) {}

    public Folder create(Request req) {
        Folder folder = new Folder();
        apply(folder, req);
        return repository.save(folder);
    }

    public Folder update(Long id, Request req) {
        Folder folder = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("No such folder: " + id));
        apply(folder, req);
        return repository.save(folder);
    }

    /** Deleting a folder detaches (doesn't delete) its notes and child folders — they move to root. */
    public void delete(Long id) {
        for (Folder f : repository.findAll()) {
            if (id.equals(f.getParentId())) {
                f.setParentId(null);
                repository.save(f);
            }
        }
        repository.deleteById(id);
    }

    private void apply(Folder folder, Request req) {
        if (req.parentId() != null && req.parentId().equals(folder.getId())) {
            throw new IllegalArgumentException("A folder can't be its own parent");
        }
        folder.setParentId(req.parentId());
        folder.setName(req.name());
        folder.setColorTag(req.colorTag());
    }
}
