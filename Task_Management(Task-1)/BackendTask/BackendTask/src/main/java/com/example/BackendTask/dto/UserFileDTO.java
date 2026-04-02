package com.example.BackendTask.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserFileDTO {
    private Long id;
    private Long userId;
    private Long fileId;
    private String tag;
    private LocalDateTime createdAt;
}
