package com.petcare.petwellness.Util;

import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


@Component
public class FileStorageUtil {

    
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String subFolder) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is missing or empty");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new BadRequestException("Uploaded file name is invalid");
        }

        String safeFileName = originalName.replaceAll("[\\\\/:*?\"<>|]", "_");
        String uniqueFileName = UUID.randomUUID() + "_" + safeFileName;

        Path folderPath = Paths.get(uploadDir, subFolder);
        try {
            Files.createDirectories(folderPath);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create upload directory: " + folderPath, e);
        }

        Path destination = folderPath.resolve(uniqueFileName);
        try {
            file.transferTo(destination.toFile());
            return toUploadsWebPath(subFolder, uniqueFileName);
        } catch (IOException e) {
            throw new RuntimeException("File saving failed at path: " + destination.toAbsolutePath(), e);
        }
    }

    public String toWebPath(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return storedPath;
        }

        String trimmed = storedPath.trim();
        if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/uploads\\")) {
            return trimmed.replace('\\', '/');
        }
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }

        Path uploadRoot = getUploadRootPath();
        try {
            Path candidatePath = Paths.get(trimmed).toAbsolutePath().normalize();
            if (candidatePath.startsWith(uploadRoot)) {
                Path relative = uploadRoot.relativize(candidatePath);
                String relativePosix = relative.toString().replace('\\', '/');
                return "/uploads/" + relativePosix;
            }
        } catch (InvalidPathException ignored) {
            // Ignore invalid local path; fall back to returning the original string.
        }

        return trimmed;
    }

    public void deleteFileQuietly(String absolutePath) {
        if (absolutePath == null || absolutePath.isBlank()) {
            return;
        }

        try {
            Files.deleteIfExists(toAbsolutePath(absolutePath));
        } catch (IOException | InvalidPathException ignored) {
            // Best-effort cleanup; upload/update should not fail due to old-file deletion.
        }
    }

    private Path toAbsolutePath(String storedPath) {
        String trimmed = storedPath == null ? "" : storedPath.trim();
        if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/uploads\\")) {
            String relativePart = trimmed.substring("/uploads/".length()).replace('\\', '/');
            relativePart = relativePart.replaceAll("^/+", "");
            return getUploadRootPath().resolve(relativePart).normalize();
        }

        return Paths.get(trimmed);
    }

    private String toUploadsWebPath(String subFolder, String fileName) {
        String safeSubFolder = (subFolder == null ? "" : subFolder).replace('\\', '/').replaceAll("^/+", "").replaceAll("/+$", "");
        String safeFileName = (fileName == null ? "" : fileName).replace('\\', '/');
        if (safeSubFolder.isBlank()) {
            return "/uploads/" + safeFileName;
        }
        return "/uploads/" + safeSubFolder + "/" + safeFileName;
    }

    private Path getUploadRootPath() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }
}

