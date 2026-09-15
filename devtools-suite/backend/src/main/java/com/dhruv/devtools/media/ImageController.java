package com.dhruv.devtools.media;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/media/image")
public class ImageController {

    private final ImageProcessingService service;

    public ImageController(ImageProcessingService service) {
        this.service = service;
    }

    @PostMapping(value = "/convert", consumes = "multipart/form-data")
    public ResponseEntity<byte[]> convert(@RequestParam("file") MultipartFile file, @RequestParam("format") String format) throws IOException {
        var result = service.convert(file, format);
        return respond(result);
    }

    @PostMapping(value = "/enhance", consumes = "multipart/form-data")
    public ResponseEntity<byte[]> enhance(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "brightness", defaultValue = "1.0") double brightness,
            @RequestParam(value = "contrast", defaultValue = "1.0") double contrast,
            @RequestParam(value = "sharpen", defaultValue = "false") boolean sharpen,
            @RequestParam(value = "scale", defaultValue = "1.0") double scale
    ) throws IOException {
        var result = service.enhance(file, new ImageProcessingService.EnhanceOptions(brightness, contrast, sharpen, scale));
        return respond(result);
    }

    private ResponseEntity<byte[]> respond(ImageProcessingService.Converted result) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(result.fileName()).build().toString())
                .body(result.bytes());
    }
}
