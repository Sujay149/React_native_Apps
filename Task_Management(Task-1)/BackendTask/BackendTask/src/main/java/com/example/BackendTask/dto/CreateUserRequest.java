package com.example.BackendTask.dto;

import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
//what frontend /user can send to db   or what data comes to backend from frontend
@Getter
@Setter
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must be at most 20 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Size(max = 30, message = "Email must be at most 30 characters")
    private String email;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Status is required")
    private Status status;
}