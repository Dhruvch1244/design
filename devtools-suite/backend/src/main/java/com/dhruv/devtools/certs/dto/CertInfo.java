package com.dhruv.devtools.certs.dto;

import java.util.List;

public record CertInfo(
        String subject,
        String issuer,
        String serialNumber,
        String signatureAlgorithm,
        String publicKeyAlgorithm,
        Integer publicKeySizeBits,
        String notBefore,
        String notAfter,
        boolean expired,
        long daysUntilExpiry,
        List<String> subjectAlternativeNames
) {}
