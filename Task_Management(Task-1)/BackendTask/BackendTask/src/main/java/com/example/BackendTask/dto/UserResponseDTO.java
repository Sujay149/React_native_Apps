package com.example.BackendTask.dto;

import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;
import com.example.BackendTask.entity.Gender;

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
    private String employeeId;
    private Integer age;
    private Gender gender;
    private String category;
    private Long parentUserId;
    private String village;
    private String mandal;
    private String district;
    private String state;
    private Role role;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ❌ No passwordHash (security)
}
