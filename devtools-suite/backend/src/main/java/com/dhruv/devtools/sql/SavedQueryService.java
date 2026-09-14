package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.SavedQueryRequest;
import com.dhruv.devtools.sql.model.SavedQuery;
import com.dhruv.devtools.sql.repo.SavedQueryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavedQueryService {

    private final SavedQueryRepository repository;
    private final ObjectMapper objectMapper;

    public SavedQueryService(SavedQueryRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<SavedQuery> list() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    public SavedQuery get(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("No such saved query: " + id));
    }

    public SavedQuery create(SavedQueryRequest req) {
        SavedQuery entity = new SavedQuery();
        apply(entity, req);
        return repository.save(entity);
    }

    public SavedQuery update(Long id, SavedQueryRequest req) {
        SavedQuery entity = get(id);
        apply(entity, req);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public SavedQuery setFavourite(Long id, boolean favourite) {
        SavedQuery entity = get(id);
        entity.setFavourite(favourite);
        return repository.save(entity);
    }

    private void apply(SavedQuery entity, SavedQueryRequest req) {
        entity.setName(req.name());
        entity.setDescription(req.description());
        entity.setSqlText(req.sqlText());
        entity.setConnectionId(req.connectionId());
        entity.setTags(req.tags());
        entity.setFavourite(req.favourite());
        try {
            entity.setParamSchemaJson(objectMapper.writeValueAsString(req.paramNames() == null ? List.of() : req.paramNames()));
        } catch (Exception e) {
            entity.setParamSchemaJson("[]");
        }
    }
}
