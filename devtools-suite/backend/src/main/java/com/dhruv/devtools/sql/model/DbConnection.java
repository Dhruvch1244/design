package com.dhruv.devtools.sql.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "db_connection")
public class DbConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    /** postgresql | mysql | sqlite | h2 | sqlserver */
    @Column(nullable = false, length = 20)
    private String driver;

    @Column(nullable = false, length = 500)
    private String jdbcUrl;

    @Column(length = 120)
    private String username;

    /** AES-GCM encrypted via CredentialVault; empty if the user chose not to save it. */
    @Column(length = 500)
    private String encryptedPassword;

    @Column(nullable = false)
    private boolean readOnly = true;

    @Column(length = 20)
    private String colorTag;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDriver() { return driver; }
    public void setDriver(String driver) { this.driver = driver; }
    public String getJdbcUrl() { return jdbcUrl; }
    public void setJdbcUrl(String jdbcUrl) { this.jdbcUrl = jdbcUrl; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEncryptedPassword() { return encryptedPassword; }
    public void setEncryptedPassword(String encryptedPassword) { this.encryptedPassword = encryptedPassword; }
    public boolean isReadOnly() { return readOnly; }
    public void setReadOnly(boolean readOnly) { this.readOnly = readOnly; }
    public String getColorTag() { return colorTag; }
    public void setColorTag(String colorTag) { this.colorTag = colorTag; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
