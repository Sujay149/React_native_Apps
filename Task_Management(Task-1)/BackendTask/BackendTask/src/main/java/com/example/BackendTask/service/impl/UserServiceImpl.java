package com.example.BackendTask.service.impl;

import com.example.BackendTask.dto.*;
import com.example.BackendTask.entity.File;
import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.RoleEntity;
import com.example.BackendTask.entity.Status;
import com.example.BackendTask.entity.User;
import com.example.BackendTask.entity.UserFile;
import com.example.BackendTask.entity.UserRole;
import com.example.BackendTask.entity.UserRoleId;
import com.example.BackendTask.exception.BadRequestException;
import com.example.BackendTask.exception.NotFoundException;
import com.example.BackendTask.mapper.UserMapper;
import com.example.BackendTask.repository.FileRepository;
import com.example.BackendTask.repository.RoleEntityRepository;
import com.example.BackendTask.repository.UserRepository;
import com.example.BackendTask.repository.UserFileRepository;
import com.example.BackendTask.repository.UserRoleRepository;
import com.example.BackendTask.service.UserService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repo;
    private final UserMapper mapper;
    private final FileRepository fileRepository;
    private final UserFileRepository userFileRepository;
    private final RoleEntityRepository roleEntityRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository repo,
                           UserMapper mapper,
                           FileRepository fileRepository,
                           UserFileRepository userFileRepository,
                           RoleEntityRepository roleEntityRepository,
                           UserRoleRepository userRoleRepository,
                           PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.mapper = mapper;
        this.fileRepository = fileRepository;
        this.userFileRepository = userFileRepository;
        this.roleEntityRepository = roleEntityRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 🔹 CREATE
    @Override
    public UserResponseDTO createUser(CreateUserRequest request) {
        validateUserRequest(request);

        // ✅ validation
        if (repo.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank() && repo.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone already exists");
        }

        // DTO → Entity
        User user = mapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Save
        User saved = repo.save(user);
        // Entity → DTO
        return mapper.toDTO(saved);
    }

    // 🔹 GET ALL
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return repo.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserWithFilesDTO> getUsersWithFiles() {
        return repo.findAll()
                .stream()
                .map(user -> {
                    UserWithFilesDTO dto = new UserWithFilesDTO();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole());
                    dto.setStatus(user.getStatus());
                    dto.setCreatedAt(user.getCreatedAt());

                        List<FileMetadataDTO> mappedFiles = userFileRepository.findByUser(user)
                            .stream()
                            .map(UserFile::getFile)
                            .map(this::toFileDto)
                            .toList();

                        List<FileMetadataDTO> uploadedFiles = fileRepository.findByUploadedBy_Id(user.getId())
                            .stream()
                            .map(this::toFileDto)
                            .toList();

                        LinkedHashMap<Long, FileMetadataDTO> uniqueFiles = new LinkedHashMap<>();
                        mappedFiles.forEach(f -> uniqueFiles.put(f.getId(), f));
                        uploadedFiles.forEach(f -> uniqueFiles.put(f.getId(), f));

                        dto.setFiles(new ArrayList<>(uniqueFiles.values()));
                    return dto;
                })
                .toList();
    }

    // 🔹 GET BY ID
    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = repo.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found"));

        return mapper.toDTO(user);
    }

    // 🔹 UPDATE
    @Override
    public UserResponseDTO updateUser(Long id, CreateUserRequest request) {
        validateUserRequest(request);

        User user = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getEmail().equals(request.getEmail()) && repo.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String existingPhone = user.getPhone();
            if ((existingPhone == null || !existingPhone.equals(request.getPhone())) && repo.existsByPhone(request.getPhone())) {
                throw new BadRequestException("Phone already exists");
            }
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User updated = repo.save(user);

        return mapper.toDTO(updated);
    }

    // 🔹 DELETE
    @Override
    public boolean deleteUser(Long id) {

        if (!repo.existsById(id)) {
            return false;
        }

        repo.deleteById(id);
        return true;
    }

    @Override
    public CsvUploadResultDTO uploadUsersCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CSV file is required");
        }

        if (!"text/csv".equals(file.getContentType())) {
            throw new BadRequestException("Only text/csv is accepted");
        }

        CsvUploadResultDTO result = new CsvUploadResultDTO();
        List<UserResponseDTO> created = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int row = 0;

            while ((line = reader.readLine()) != null) {
                row++;
                if (line.isBlank()) {
                    continue;
                }

                if (row == 1 && line.toLowerCase().startsWith("name,")) {
                    continue;
                }

                result.setTotalRows(result.getTotalRows() + 1);
                String[] parts = line.split(",");
                if (parts.length < 5) {
                    errors.add("Row " + row + ": expected 5 columns (name,email,password,role,status)");
                    continue;
                }

                String name = parts[0].trim();
                String email = parts[1].trim();
                String password = parts[2].trim();
                String roleRaw = parts[3].trim();
                String statusRaw = parts[4].trim();

                if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                    errors.add("Row " + row + ": name/email/password must not be empty");
                    continue;
                }

                if (repo.existsByEmail(email)) {
                    errors.add("Row " + row + ": email already exists - " + email);
                    continue;
                }

                Role role;
                Status status;
                try {
                    role = Role.valueOf(roleRaw.toUpperCase());
                } catch (IllegalArgumentException ex) {
                    errors.add("Row " + row + ": invalid role - " + roleRaw);
                    continue;
                }

                try {
                    status = Status.valueOf(statusRaw.toUpperCase());
                } catch (IllegalArgumentException ex) {
                    errors.add("Row " + row + ": invalid status - " + statusRaw);
                    continue;
                }

                CreateUserRequest request = new CreateUserRequest();
                request.setName(name);
                request.setEmail(email);
                request.setPassword(password);
                request.setRole(role);
                request.setStatus(status);

                UserResponseDTO createdUser = createUser(request);
                created.add(createdUser);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        result.setCreatedUsers(created);
        result.setErrors(errors);
        result.setSuccessCount(created.size());
        result.setFailedCount(errors.size());
        return result;
    }

    @Override
    public UserFileDTO attachFileToUser(Long userId, Long fileId, String tag) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("File not found"));

        UserFile mapping = userFileRepository.findByUser_IdAndFile_Id(userId, fileId)
                .orElseGet(UserFile::new);

        mapping.setUser(user);
        mapping.setFile(file);
        mapping.setTag(tag);
        if (mapping.getCreatedAt() == null) {
            mapping.setCreatedAt(LocalDateTime.now());
        }

        UserFile saved = userFileRepository.save(mapping);
        UserFileDTO dto = new UserFileDTO();
        dto.setId(saved.getId());
        dto.setUserId(saved.getUser().getId());
        dto.setFileId(saved.getFile().getId());
        dto.setTag(saved.getTag());
        dto.setCreatedAt(saved.getCreatedAt());
        return dto;
    }

    @Override
    public List<FileMetadataDTO> getUserFiles(Long userId) {
        User user = repo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        return userFileRepository.findByUser(user)
                .stream()
                .map(UserFile::getFile)
                .map(this::toFileDto)
                .toList();
    }

    @Override
    public void removeFileFromUser(Long userId, Long fileId) {
        UserFile mapping = userFileRepository.findByUser_IdAndFile_Id(userId, fileId)
                .orElseThrow(() -> new NotFoundException("User-file mapping not found"));
        userFileRepository.delete(mapping);
    }

    @Override
    public void assignRoleToUser(Long userId, Integer roleId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        RoleEntity role = roleEntityRepository.findById(roleId)
                .orElseThrow(() -> new NotFoundException("Role not found"));

        UserRoleId id = new UserRoleId(userId, roleId);
        if (userRoleRepository.existsById(id)) {
            syncUserRole(user, role);
            return;
        }

        UserRole mapping = new UserRole();
        mapping.setId(id);
        mapping.setUser(user);
        mapping.setRole(role);
        userRoleRepository.save(mapping);

        syncUserRole(user, role);
    }

    private void syncUserRole(User user, RoleEntity role) {
        // Keep legacy single-role column in sync with mapping for UI/API consistency.
        try {
            user.setRole(Role.valueOf(role.getName().toUpperCase()));
            repo.save(user);
        } catch (IllegalArgumentException ignored) {
            // If role name doesn't match enum values, keep mapping only.
        }
    }

    @Override
    public List<UserRoleDTO> getUserRoles(Long userId) {
        if (!repo.existsById(userId)) {
            throw new NotFoundException("User not found");
        }

        return userRoleRepository.findByUser_Id(userId)
                .stream()
                .map(x -> new UserRoleDTO(x.getRole().getId(), x.getRole().getName()))
                .toList();
    }

    private FileMetadataDTO toFileDto(File file) {
        FileMetadataDTO dto = new FileMetadataDTO();
        dto.setId(file.getId());
        dto.setUuid(file.getUuid());
        dto.setFileName(file.getFileName());
        dto.setFileType(file.getFileType());
        dto.setFileSize(file.getFileSize());
        dto.setStoragePath(file.getStoragePath());
        dto.setUploadedBy(file.getUploadedBy() != null ? file.getUploadedBy().getId() : null);
        dto.setCreatedAt(file.getCreatedAt());
        return dto;
    }

    private void validateUserRequest(CreateUserRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (request.getRole() == null) {
            throw new BadRequestException("Role is required");
        }
        if (request.getStatus() == null) {
            throw new BadRequestException("Status is required");
        }
        if (request.getName().length() > 20) {
            throw new BadRequestException("Name must be at most 20 characters");
        }
        if (request.getEmail().length() > 30) {
            throw new BadRequestException("Email must be at most 30 characters");
        }
        if (request.getPhone() != null && request.getPhone().length() > 20) {
            throw new BadRequestException("Phone must be at most 20 characters");
        }
    }
}