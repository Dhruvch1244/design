package com.dhruv.devtools.media;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/media/pdf")
public class PdfController {

    private final PdfService service;

    public PdfController(PdfService service) {
        this.service = service;
    }

    @PostMapping(value = "/from-images", consumes = "multipart/form-data")
    public ResponseEntity<byte[]> fromImages(@RequestParam("files") List<MultipartFile> files) throws IOException {
        byte[] pdf = service.imagesToPdf(files);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename("converted.pdf").build().toString())
                .body(pdf);
    }

    @PostMapping(value = "/to-images", consumes = "multipart/form-data")
    public ResponseEntity<byte[]> toImages(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "format", defaultValue = "png") String format,
            @RequestParam(value = "dpi", defaultValue = "150") int dpi
    ) throws IOException {
        var result = service.pdfToImages(file, format, dpi);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("pdf-pages.zip").build().toString())
                .header("X-Page-Count", String.valueOf(result.pageCount()))
                .body(result.zipBytes());
    }
}
