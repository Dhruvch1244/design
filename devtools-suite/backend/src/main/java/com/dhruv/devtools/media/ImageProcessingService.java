package com.dhruv.devtools.media;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.BufferedImageOp;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.awt.image.RescaleOp;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

@Service
public class ImageProcessingService {

    private static final Set<String> SUPPORTED_FORMATS = Set.of("png", "jpg", "jpeg", "bmp", "gif");

    public record Converted(byte[] bytes, String contentType, String fileName) {}

    /** Re-encodes an uploaded image into a different container format (PNG/JPEG/BMP/GIF). */
    public Converted convert(MultipartFile file, String targetFormat) throws IOException {
        String format = normalizeFormat(targetFormat);
        BufferedImage image = read(file);

        // JPEG/BMP don't support alpha — flatten onto white first so transparent PNGs don't come out black.
        if ((format.equals("jpg") || format.equals("jpeg") || format.equals("bmp")) && image.getColorModel().hasAlpha()) {
            image = flatten(image);
        }

        byte[] bytes = encode(image, format);
        String baseName = stripExtension(file.getOriginalFilename());
        return new Converted(bytes, contentTypeFor(format), baseName + "." + format);
    }

    public record EnhanceOptions(double brightness, double contrast, boolean sharpen, double scale) {}

    /** Applies brightness/contrast/sharpen/resize, in that order (resize first so sharpen acts on final pixels). */
    public Converted enhance(MultipartFile file, EnhanceOptions opts) throws IOException {
        BufferedImage image = read(file);

        if (opts.scale() > 0 && Math.abs(opts.scale() - 1.0) > 0.001) {
            image = scale(image, opts.scale());
        }

        if (Math.abs(opts.brightness() - 1.0) > 0.001 || Math.abs(opts.contrast() - 1.0) > 0.001) {
            image = adjustBrightnessContrast(image, opts.brightness(), opts.contrast());
        }

        if (opts.sharpen()) {
            image = sharpen(image);
        }

        String format = file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase().endsWith(".png") ? "png" : "jpg";
        byte[] bytes = encode(image, format);
        String baseName = stripExtension(file.getOriginalFilename());
        return new Converted(bytes, contentTypeFor(format), baseName + "-enhanced." + format);
    }

    private BufferedImage read(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Uploaded file is empty.");
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) throw new IllegalArgumentException("Could not decode '" + file.getOriginalFilename() + "' as an image.");
        return image;
    }

    private String normalizeFormat(String format) {
        String f = format == null ? "" : format.trim().toLowerCase();
        if (!SUPPORTED_FORMATS.contains(f)) {
            throw new IllegalArgumentException("Unsupported target format '" + format + "' (use png, jpg, bmp, or gif).");
        }
        return f.equals("jpeg") ? "jpg" : f;
    }

    private BufferedImage flatten(BufferedImage src) {
        BufferedImage flat = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = flat.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, src.getWidth(), src.getHeight());
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return flat;
    }

    private BufferedImage scale(BufferedImage src, double factor) {
        int w = Math.max(1, (int) Math.round(src.getWidth() * factor));
        int h = Math.max(1, (int) Math.round(src.getHeight() * factor));
        BufferedImage dst = new BufferedImage(w, h, src.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Graphics2D g = dst.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return dst;
    }

    /** brightness/contrast as user-facing multipliers around 1.0 (0.5 = darker/flatter, 2.0 = brighter/punchier). */
    private BufferedImage adjustBrightnessContrast(BufferedImage src, double brightness, double contrast) {
        BufferedImage rgb = flatten(src);
        float scaleFactor = (float) contrast;
        float offset = (float) ((brightness - 1.0) * 255);
        RescaleOp op = new RescaleOp(scaleFactor, offset, null);
        BufferedImageOp safeOp = op;
        BufferedImage dst = new BufferedImage(rgb.getWidth(), rgb.getHeight(), BufferedImage.TYPE_INT_RGB);
        safeOp.filter(rgb, dst);
        return dst;
    }

    private BufferedImage sharpen(BufferedImage src) {
        float[] kernelData = {
            0f, -1f, 0f,
            -1f, 5f, -1f,
            0f, -1f, 0f,
        };
        ConvolveOp op = new ConvolveOp(new Kernel(3, 3, kernelData), ConvolveOp.EDGE_NO_OP, null);
        BufferedImage safeSrc = src.getColorModel().hasAlpha() ? flatten(src) : src;
        BufferedImage dst = new BufferedImage(safeSrc.getWidth(), safeSrc.getHeight(), BufferedImage.TYPE_INT_RGB);
        op.filter(safeSrc, dst);
        return dst;
    }

    private byte[] encode(BufferedImage image, String format) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        if (!ImageIO.write(image, format, out)) {
            throw new IllegalArgumentException("No writer available for format '" + format + "'.");
        }
        return out.toByteArray();
    }

    private String contentTypeFor(String format) {
        return switch (format) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "bmp" -> "image/bmp";
            case "gif" -> "image/gif";
            default -> "image/png";
        };
    }

    private String stripExtension(String name) {
        if (name == null || name.isBlank()) return "image";
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }
}
