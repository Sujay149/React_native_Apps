package com.example.BackendTask.service;

import com.example.BackendTask.dto.FileMetadataDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {
    FileMetadataDTO uploadSingle(MultipartFile file, Long uploadedBy);

    List<FileMetadataDTO> uploadMultiple(List<MultipartFile> files, Long uploadedBy);

    Resource download(Long fileId);

    FileMetadataDTO getMetadata(Long fileId);

    void delete(Long fileId);
}
