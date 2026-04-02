package com.example.BackendTask.service.impl;

import com.example.BackendTask.dto.FileMetadataDTO;
import com.example.BackendTask.entity.File;
import com.example.BackendTask.entity.User;
import com.example.BackendTask.entity.UserFile;
import com.example.BackendTask.exception.BadRequestException;
import com.example.BackendTask.exception.NotFoundException;
import com.example.BackendTask.repository.FileRepository;
import com.example.BackendTask.repository.UserFileRepository;
import com.example.BackendTask.repository.UserRepository;
import com.example.BackendTask.service.FileService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "application/pdf",
            "text/csv"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final UserFileRepository userFileRepository;

    @Value("${app.file.storage-dir:uploads}")
    private String storageDir;

    public FileServiceImpl(FileRepository fileRepository,
                           UserRepository userRepository,
                           UserFileRepository userFileRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.userFileRepository = userFileRepository;
    }

    @Override
    public FileMetadataDTO uploadSingle(MultipartFile file, Long uploadedBy) {
        validateFile(file);
        User user = userRepository.findById(uploadedBy)
                .orElseThrow(() -> new NotFoundException("User not found: " + uploadedBy));

        try {
            Path uploadDir = Paths.get(storageDir);
            Files.createDirectories(uploadDir);

            String uuid = UUID.randomUUID().toString();
            String storedFileName = uuid + "_" + file.getOriginalFilename();
            Path fullPath = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), fullPath, StandardCopyOption.REPLACE_EXISTING);

            File metadata = new File();
            metadata.setUuid(uuid);
            metadata.setFileName(file.getOriginalFilename());
            metadata.setFileType(file.getContentType());
            metadata.setFileSize(file.getSize());
            metadata.setStoragePath(fullPath.toString());
            metadata.setUploadedBy(user);
            metadata.setCreatedAt(LocalDateTime.now());

            File saved = fileRepository.save(metadata);

            UserFile userFile = new UserFile();
            userFile.setUser(user);
            userFile.setFile(saved);
            userFile.setCreatedAt(LocalDateTime.now());
            userFileRepository.save(userFile);

            return toDto(saved);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public List<FileMetadataDTO> uploadMultiple(List<MultipartFile> files, Long uploadedBy) {
        return files.stream().map(file -> uploadSingle(file, uploadedBy)).toList();
    }

    @Override
    public Resource download(Long fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found: " + fileId));

        Path path = Paths.get(file.getStoragePath());
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new NotFoundException("Stored file not found on disk");
        }
        return resource;
    }

    @Override
    public FileMetadataDTO getMetadata(Long fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found: " + fileId));
        return toDto(file);
    }

    @Override
    public void delete(Long fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found: " + fileId));

        try {
            Files.deleteIfExists(Paths.get(file.getStoragePath()));
        } catch (IOException e) {
            throw new BadRequestException("Failed to delete physical file: " + e.getMessage());
        }

        fileRepository.delete(file);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5MB limit");
        }

        String type = file.getContentType();
        if (type == null || !ALLOWED_TYPES.contains(type)) {
            throw new BadRequestException("Invalid file type: " + type);
        }
    }

    private FileMetadataDTO toDto(File file) {
        FileMetadataDTO dto = new FileMetadataDTO();
        dto.setId(file.getId());
        dto.setUuid(file.getUuid());
        dto.setFileName(file.getFileName());
        dto.setFileType(file.getFileType());
        dto.setFileSize(file.getFileSize());
        dto.setStoragePath(file.getStoragePath());
        dto.setUploadedBy(file.getUploadedBy().getId());
        dto.setCreatedAt(file.getCreatedAt());
        return dto;
    }
}
