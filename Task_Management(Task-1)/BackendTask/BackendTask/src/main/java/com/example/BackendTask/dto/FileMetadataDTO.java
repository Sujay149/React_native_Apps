package com.example.BackendTask.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FileMetadataDTO {
    private Long id;
    private String uuid;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String storagePath;
    private Long uploadedBy;
    private LocalDateTime createdAt;
}
