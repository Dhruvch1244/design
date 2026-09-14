package com.dhruv.devtools.certs;

import com.dhruv.devtools.certs.dto.CertInfo;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Decodes PEM/DER certificates using the JDK's own X.509 parser rather than hand-rolling ASN.1 —
 * that format has enough edge cases (extension encodings, name types) that reimplementing it in
 * JS would be its own multi-week project for no real benefit over what's already in the JDK.
 */
@Service
public class CertInspectService {

    public List<CertInfo> inspect(String pemOrDer) throws CertificateException {
        CertificateFactory factory = CertificateFactory.getInstance("X.509");
        byte[] bytes = pemOrDer.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        List<CertInfo> results = new ArrayList<>();
        for (var cert : factory.generateCertificates(new ByteArrayInputStream(bytes))) {
            results.add(describe((X509Certificate) cert));
        }
        if (results.isEmpty()) {
            throw new CertificateException("No certificates found — expected PEM (-----BEGIN CERTIFICATE-----) or DER bytes");
        }
        return results;
    }

    private CertInfo describe(X509Certificate cert) {
        Instant notAfter = cert.getNotAfter().toInstant();
        boolean expired = notAfter.isBefore(Instant.now());
        long daysUntilExpiry = Duration.between(Instant.now(), notAfter).toDays();

        List<String> sans = new ArrayList<>();
        try {
            var altNames = cert.getSubjectAlternativeNames();
            if (altNames != null) {
                for (List<?> entry : altNames) {
                    sans.add(sanTypeName((Integer) entry.get(0)) + ":" + entry.get(1));
                }
            }
        } catch (CertificateException ignored) {
            // Malformed SAN extension in a cert someone's inspecting because it's broken — skip, don't fail the whole request.
        }

        PublicKey key = cert.getPublicKey();
        Integer keySize = null;
        if (key instanceof RSAPublicKey rsa) keySize = rsa.getModulus().bitLength();
        else if (key instanceof ECPublicKey ec) keySize = ec.getParams().getCurve().getField().getFieldSize();

        return new CertInfo(
                cert.getSubjectX500Principal().getName(),
                cert.getIssuerX500Principal().getName(),
                cert.getSerialNumber().toString(16),
                cert.getSigAlgName(),
                key.getAlgorithm(),
                keySize,
                cert.getNotBefore().toInstant().toString(),
                notAfter.toString(),
                expired,
                daysUntilExpiry,
                sans
        );
    }

    private String sanTypeName(int type) {
        return switch (type) {
            case 1 -> "email";
            case 2 -> "DNS";
            case 6 -> "URI";
            case 7 -> "IP";
            default -> "type" + type;
        };
    }
}
