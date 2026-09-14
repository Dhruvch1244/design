package com.dhruv.devtools.javatools;

import com.dhruv.devtools.javatools.dto.JarInspectResult.Response;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/java/jar-inspect")
public class JarInspectController {

    private final JarInspectService jarInspectService;

    public JarInspectController(JarInspectService jarInspectService) {
        this.jarInspectService = jarInspectService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public Response inspect(@RequestParam("files") List<MultipartFile> files) throws IOException {
        return jarInspectService.inspect(files);
    }
}
