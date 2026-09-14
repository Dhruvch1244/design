package com.dhruv.devtools.sql;

import com.dhruv.devtools.sql.dto.ConnectionRequest;
import com.dhruv.devtools.sql.dto.ConnectionResponse;
import com.dhruv.devtools.sql.model.DbConnection;
import com.dhruv.devtools.sql.repo.DbConnectionRepository;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectionService {

    private static final Map<String, String> DRIVER_CLASSES = Map.of(
            "postgresql", "org.postgresql.Driver",
            "mysql", "com.mysql.cj.jdbc.Driver",
            "sqlite", "org.sqlite.JDBC",
            "h2", "org.h2.Driver",
            "sqlserver", "com.microsoft.sqlserver.jdbc.SQLServerDriver"
    );

    private final DbConnectionRepository repository;
    private final CredentialVault vault;
    private final Map<Long, HikariDataSource> pools = new ConcurrentHashMap<>();

    public ConnectionService(DbConnectionRepository repository, CredentialVault vault) {
        this.repository = repository;
        this.vault = vault;
    }

    public List<ConnectionResponse> list() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public ConnectionResponse create(ConnectionRequest req) {
        DbConnection entity = new DbConnection();
        applyRequest(entity, req);
        entity = repository.save(entity);
        return toResponse(entity);
    }

    public ConnectionResponse update(Long id, ConnectionRequest req) {
        DbConnection entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No such connection: " + id));
        applyRequest(entity, req);
        entity = repository.save(entity);
        evict(id);
        return toResponse(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
        evict(id);
    }

    public String testConnection(Long id) {
        try (Connection c = dataSource(id).getConnection()) {
            return "Connected — " + c.getMetaData().getDatabaseProductName() + " " + c.getMetaData().getDatabaseProductVersion();
        } catch (SQLException e) {
            throw new IllegalArgumentException("Connection failed: " + e.getMessage());
        }
    }

    public DbConnection entity(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("No such connection: " + id));
    }

    /** Lazily creates and caches a small pool per connection id; reused across query runs. */
    public HikariDataSource dataSource(Long id) {
        return pools.computeIfAbsent(id, this::buildDataSource);
    }

    private HikariDataSource buildDataSource(Long id) {
        DbConnection entity = entity(id);
        String driverClass = DRIVER_CLASSES.get(entity.getDriver());
        if (driverClass == null) {
            throw new IllegalArgumentException("Unsupported driver: " + entity.getDriver());
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driverClass);
        config.setJdbcUrl(entity.getJdbcUrl());
        if (entity.getUsername() != null && !entity.getUsername().isBlank()) {
            config.setUsername(entity.getUsername());
        }
        String password = vault.decrypt(entity.getEncryptedPassword());
        if (!password.isEmpty()) {
            config.setPassword(password);
        }
        config.setMaximumPoolSize(4);
        config.setMinimumIdle(0);
        config.setPoolName("devtools-conn-" + id);
        config.setReadOnly(entity.isReadOnly());
        return new HikariDataSource(config);
    }

    private void evict(Long id) {
        HikariDataSource removed = pools.remove(id);
        if (removed != null) removed.close();
    }

    @PreDestroy
    void shutdown() {
        pools.values().forEach(HikariDataSource::close);
    }

    private void applyRequest(DbConnection entity, ConnectionRequest req) {
        entity.setName(req.name());
        entity.setDriver(req.driver());
        entity.setJdbcUrl(req.jdbcUrl());
        entity.setUsername(req.username());
        entity.setReadOnly(req.readOnly());
        entity.setColorTag(req.colorTag());
        if (req.password() != null) {
            entity.setEncryptedPassword(req.password().isEmpty() ? "" : vault.encrypt(req.password()));
        }
    }

    private ConnectionResponse toResponse(DbConnection e) {
        return new ConnectionResponse(
                e.getId(), e.getName(), e.getDriver(), e.getJdbcUrl(), e.getUsername(),
                e.getEncryptedPassword() != null && !e.getEncryptedPassword().isEmpty(),
                e.isReadOnly(), e.getColorTag(), e.getCreatedAt());
    }
}
