package com.example.BackendTask.dto;

import com.example.BackendTask.entity.Status;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDTO {
    private Long id;
    private Long assignedById;
    private String assignedByName;
    private Long assignedToId;
    private String assignedToName;
    private String resourceType;
    private Long resourceId;
    private String resourceName;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
