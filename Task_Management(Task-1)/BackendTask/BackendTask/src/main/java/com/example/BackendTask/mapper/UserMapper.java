package com.example.BackendTask.mapper;

import com.example.BackendTask.entity.User;
import com.example.BackendTask.dto.UserResponseDTO;
import com.example.BackendTask.dto.CreateUserRequest;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    public UserResponseDTO toDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }

    public User toEntity(CreateUserRequest request) {
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(request.getPassword());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());
        user.setCreatedAt(LocalDateTime.now());

        return user;
    }
}