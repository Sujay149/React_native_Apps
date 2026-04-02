package com.example.BackendTask.service;

import com.example.BackendTask.dto.UserResponseDTO;
import com.example.BackendTask.dto.CreateUserRequest;
import com.example.BackendTask.dto.CsvUploadResultDTO;
import com.example.BackendTask.dto.FileMetadataDTO;
import com.example.BackendTask.dto.UserFileDTO;
import com.example.BackendTask.dto.UserRoleDTO;
import com.example.BackendTask.dto.UserWithFilesDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    UserResponseDTO createUser(CreateUserRequest request);

    List<UserResponseDTO> getAllUsers();

    List<UserWithFilesDTO> getUsersWithFiles();

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUser(Long id, CreateUserRequest request);

    boolean deleteUser(Long id);

    CsvUploadResultDTO uploadUsersCsv(MultipartFile file);

    UserFileDTO attachFileToUser(Long userId, Long fileId, String tag);

    List<FileMetadataDTO> getUserFiles(Long userId);

    void removeFileFromUser(Long userId, Long fileId);

    void assignRoleToUser(Long userId, Integer roleId);

    List<UserRoleDTO> getUserRoles(Long userId);
}