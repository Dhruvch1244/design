package com.dhruv.devtools.sql;

import com.dhruv.devtools.common.storage.WorkspaceRoot;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Set;

/**
 * Encrypts saved DB connection passwords at rest with AES-256-GCM, using a random key generated
 * on first run and stored in the workspace directory (not the Git repo, not the H2 DB file).
 *
 * This protects against passwords being readable by casually opening connections.json or a backup
 * of it — it is not a substitute for a real secret manager. Anyone with read access to both the
 * workspace directory's key file and the config file can still decrypt everything, since both live
 * on the same machine under the same user. For genuinely sensitive production credentials, prefer
 * leaving the password blank and entering it per-session instead of saving it.
 */
@Component
public class CredentialVault {

    private static final String ALGO = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int GCM_IV_BYTES = 12;

    private final SecretKey key;

    public CredentialVault(WorkspaceRoot workspaceRoot) {
        this.key = loadOrCreateKey(workspaceRoot);
    }

    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) return "";
        try {
            byte[] iv = new byte[GCM_IV_BYTES];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGO);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] cipherText = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + cipherText.length);
            buffer.put(iv).put(cipherText);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Failed to encrypt credential", e);
        }
    }

    public String decrypt(String encoded) {
        if (encoded == null || encoded.isEmpty()) return "";
        try {
            byte[] raw = Base64.getDecoder().decode(encoded);
            ByteBuffer buffer = ByteBuffer.wrap(raw);
            byte[] iv = new byte[GCM_IV_BYTES];
            buffer.get(iv);
            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGO);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            return new String(cipher.doFinal(cipherText), java.nio.charset.StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Failed to decrypt credential — the key file may have changed", e);
        }
    }

    private SecretKey loadOrCreateKey(WorkspaceRoot workspaceRoot) {
        Path keyFile = workspaceRoot.resolve("config/credential.key");
        try {
            Files.createDirectories(keyFile.getParent());
            if (Files.exists(keyFile)) {
                byte[] keyBytes = Base64.getDecoder().decode(Files.readString(keyFile).trim());
                return new SecretKeySpec(keyBytes, "AES");
            }
            byte[] keyBytes = new byte[32];
            new SecureRandom().nextBytes(keyBytes);
            Files.writeString(keyFile, Base64.getEncoder().encodeToString(keyBytes));
            restrictToOwnerOnly(keyFile);
            return new SecretKeySpec(keyBytes, "AES");
        } catch (IOException e) {
            throw new IllegalStateException("Could not load or create credential key at " + keyFile, e);
        }
    }

    private void restrictToOwnerOnly(Path file) {
        try {
            if (file.getFileSystem().supportedFileAttributeViews().contains("posix")) {
                Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rw-------");
                Files.setPosixFilePermissions(file, perms);
            }
        } catch (IOException | UnsupportedOperationException ignored) {
            // Best-effort; Windows ACLs are left at their default (user-profile-scoped) permissions.
        }
    }
}
