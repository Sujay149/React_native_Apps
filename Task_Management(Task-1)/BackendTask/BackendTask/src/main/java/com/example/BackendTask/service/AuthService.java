package com.example.BackendTask.service;

import com.example.BackendTask.dto.AuthLoginRequestDTO;
import com.example.BackendTask.dto.AuthSignupRequestDTO;
import com.example.BackendTask.dto.AuthTokenResponseDTO;
import com.example.BackendTask.dto.UserResponseDTO;

public interface AuthService {
    UserResponseDTO signup(AuthSignupRequestDTO request);

    AuthTokenResponseDTO login(AuthLoginRequestDTO request);
}
