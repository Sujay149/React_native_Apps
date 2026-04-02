package com.example.BackendTask.service.impl;

import com.example.BackendTask.dto.AuthLoginRequestDTO;
import com.example.BackendTask.dto.AuthSignupRequestDTO;
import com.example.BackendTask.dto.AuthTokenResponseDTO;
import com.example.BackendTask.dto.UserResponseDTO;
import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;
import com.example.BackendTask.entity.User;
import com.example.BackendTask.exception.BadRequestException;
import com.example.BackendTask.mapper.UserMapper;
import com.example.BackendTask.repository.UserRepository;
import com.example.BackendTask.security.JwtService;
import com.example.BackendTask.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           UserMapper userMapper,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public UserResponseDTO signup(AuthSignupRequestDTO request) {
        validateSignupRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setStatus(Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    public AuthTokenResponseDTO login(AuthLoginRequestDTO request) {
        validateLoginRequest(request);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        boolean validHashed = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        boolean validLegacy = request.getPassword().equals(user.getPasswordHash());
        if (!validHashed && !validLegacy) {
            throw new BadRequestException("Invalid email or password");
        }

        if (validLegacy) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthTokenResponseDTO("Bearer", token, jwtService.getExpirationSeconds());
    }

    private void validateSignupRequest(AuthSignupRequestDTO request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new BadRequestException("Phone is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (request.getName().length() > 20) {
            throw new BadRequestException("Name must be at most 20 characters");
        }
        if (request.getEmail().length() > 30) {
            throw new BadRequestException("Email must be at most 30 characters");
        }
        if (request.getPhone().length() > 20) {
            throw new BadRequestException("Phone must be at most 20 characters");
        }
    }

    private void validateLoginRequest(AuthLoginRequestDTO request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }
    }
}
