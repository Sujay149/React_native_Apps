package com.example.BackendTask.dto;

import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
//what will expose out of backend
@Getter
@Setter
public class UserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Status status;
    private LocalDateTime createdAt;

    // ❌ No passwordHash (security)
}