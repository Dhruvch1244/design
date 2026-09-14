package com.dhruv.devtools.certs;

import com.dhruv.devtools.certs.dto.CertInfo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.cert.CertificateException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certs")
public class CertInspectController {

    private final CertInspectService certInspectService;

    public CertInspectController(CertInspectService certInspectService) {
        this.certInspectService = certInspectService;
    }

    @PostMapping("/inspect")
    public List<CertInfo> inspect(@RequestBody Map<String, String> body) throws CertificateException {
        String pem = body.getOrDefault("pem", "");
        if (pem.isBlank()) throw new IllegalArgumentException("Paste a PEM certificate");
        return certInspectService.inspect(pem);
    }
}
