package com.example.BackendTask.service.impl;

import com.example.BackendTask.dto.AuthLoginRequestDTO;
import com.example.BackendTask.dto.AuthSignupRequestDTO;
import com.example.BackendTask.dto.AuthTokenResponseDTO;
import com.example.BackendTask.dto.UserResponseDTO;
import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;
import com.example.BackendTask.entity.User;
import com.example.BackendTask.entity.Gender;
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
        if (request.getEmployeeId() != null && userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmployeeId(request.getEmployeeId());
        user.setAge(request.getAge());
        if (request.getGender() != null) {
            user.setGender(Gender.valueOf(request.getGender().toUpperCase()));
        }
        user.setCategory(request.getCategory());
        user.setVillage(request.getVillage());
        user.setMandal(request.getMandal());
        user.setDistrict(request.getDistrict());
        user.setState(request.getState());
        user.setRole(Role.USER);
        user.setStatus(Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    public AuthTokenResponseDTO login(AuthLoginRequestDTO request) {
        validateLoginRequest(request);

        User user;
        String loginInput = request.getEmail().trim();

        // Try to find by email first, then by employee ID
        user = userRepository.findByEmail(loginInput)
                .orElseGet(() -> userRepository.findByEmployeeId(loginInput)
                        .orElseThrow(() -> new BadRequestException("Invalid email/employee ID or password")));

        boolean validHashed = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        boolean validLegacy = request.getPassword().equals(user.getPasswordHash());
        if (!validHashed && !validLegacy) {
            throw new BadRequestException("Invalid email/employee ID or password");
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
        if (request.getName().length() > 100) {
            throw new BadRequestException("Name must be at most 100 characters");
        }
        if (request.getEmail().length() > 100) {
            throw new BadRequestException("Email must be at most 100 characters");
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
