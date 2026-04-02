package com.example.BackendTask.controller;

import com.example.BackendTask.dto.*;
import com.example.BackendTask.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@Validated
@PreAuthorize("isAuthenticated()")

public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // 🔹 CREATE USER
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO createUser(@Valid @RequestBody CreateUserRequest request) {
        return service.createUser(request);
    }

    // 🔹 GET ALL USERS
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> getAllUsers() {
        return service.getAllUsers();
    }

    @GetMapping("/with-files")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserWithFilesDTO> getUsersWithFiles() {
        return service.getUsersWithFiles();
    }

    // 🔹 GET USER BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public UserResponseDTO getUserById(@PathVariable @Min(value = 1, message = "id must be positive") Long id) {
        return service.getUserById(id);
    }

    // 🔹 UPDATE USER
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public UserResponseDTO updateUser(@PathVariable @Min(value = 1, message = "id must be positive") Long id,
                              @Valid @RequestBody CreateUserRequest request) {
        return service.updateUser(id, request);
    }

    // 🔹 DELETE USER
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public boolean deleteUser(@PathVariable @Min(value = 1, message = "id must be positive") Long id) {
        return service.deleteUser(id);
    }

    @PostMapping(value = "/upload-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CsvUploadResultDTO> uploadCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(201).body(service.uploadUsersCsv(file));
    }

    @PostMapping("/{userId}/files/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<UserFileDTO> attachFileToUser(@PathVariable @Min(value = 1, message = "userId must be positive") Long userId,
                                                        @PathVariable @Min(value = 1, message = "fileId must be positive") Long fileId,
                                                        @RequestParam(required = false) String tag) {
        return ResponseEntity.status(201).body(service.attachFileToUser(userId, fileId, tag));
    }

    @GetMapping("/{userId}/files")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<FileMetadataDTO>> getUserFiles(@PathVariable @Min(value = 1, message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(service.getUserFiles(userId));
    }

    @DeleteMapping("/{userId}/files/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<Void> removeFileFromUser(@PathVariable @Min(value = 1, message = "userId must be positive") Long userId,
                                                   @PathVariable @Min(value = 1, message = "fileId must be positive") Long fileId) {
        service.removeFileFromUser(userId, fileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignRole(@PathVariable @Min(value = 1, message = "userId must be positive") Long userId,
                                           @PathVariable @Min(value = 1, message = "roleId must be positive") Integer roleId) {
        service.assignRoleToUser(userId, roleId);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/{userId}/roles")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<UserRoleDTO>> getUserRoles(@PathVariable @Min(value = 1, message = "userId must be positive") Long userId) {
        return ResponseEntity.ok(service.getUserRoles(userId));
    }
}