package com.example.BackendTask.dto;

import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UserWithFilesDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Status status;
    private LocalDateTime createdAt;
    private List<FileMetadataDTO> files;
}
