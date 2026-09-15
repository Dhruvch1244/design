package com.dhruv.devtools.media;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class PdfService {

    private static final Set<String> IMAGE_FORMATS = Set.of("png", "jpg", "jpeg");

    /** One page per uploaded image, page size matched to the image (1px = 1pt, i.e. rendered at 72 DPI). */
    public byte[] imagesToPdf(List<MultipartFile> files) throws IOException {
        if (files.isEmpty()) throw new IllegalArgumentException("Upload at least one image.");

        try (PDDocument doc = new PDDocument()) {
            for (MultipartFile file : files) {
                BufferedImage img = ImageIO.read(file.getInputStream());
                if (img == null) throw new IllegalArgumentException("Could not decode '" + file.getOriginalFilename() + "' as an image.");

                PDPage page = new PDPage(new PDRectangle(img.getWidth(), img.getHeight()));
                doc.addPage(page);
                PDImageXObject pdImage = LosslessFactory.createFromImage(doc, img);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.drawImage(pdImage, 0, 0, img.getWidth(), img.getHeight());
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    public record RenderedPages(byte[] zipBytes, int pageCount) {}

    /** Renders every page of the PDF to an image and zips them, one file per page. */
    public RenderedPages pdfToImages(MultipartFile file, String format, int dpi) throws IOException {
        String fmt = normalizeImageFormat(format);
        int clampedDpi = Math.max(36, Math.min(600, dpi));

        byte[] bytes = file.getBytes();
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            PDFRenderer renderer = new PDFRenderer(doc);
            int pageCount = doc.getNumberOfPages();
            if (pageCount == 0) throw new IllegalArgumentException("PDF has no pages.");

            ByteArrayOutputStream zipBuffer = new ByteArrayOutputStream();
            try (ZipOutputStream zip = new ZipOutputStream(zipBuffer)) {
                for (int i = 0; i < pageCount; i++) {
                    BufferedImage img = renderer.renderImageWithDPI(i, clampedDpi, ImageType.RGB);
                    ByteArrayOutputStream pageBuffer = new ByteArrayOutputStream();
                    ImageIO.write(img, fmt, pageBuffer);

                    zip.putNextEntry(new ZipEntry(String.format("page-%03d.%s", i + 1, fmt)));
                    zip.write(pageBuffer.toByteArray());
                    zip.closeEntry();
                }
            }
            return new RenderedPages(zipBuffer.toByteArray(), pageCount);
        }
    }

    private String normalizeImageFormat(String format) {
        String f = format == null ? "png" : format.trim().toLowerCase();
        if (!IMAGE_FORMATS.contains(f)) throw new IllegalArgumentException("Unsupported image format '" + format + "' (use png or jpg).");
        return f.equals("jpeg") ? "jpg" : f;
    }
}
