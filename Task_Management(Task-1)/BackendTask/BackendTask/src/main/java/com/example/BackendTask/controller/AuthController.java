package com.example.BackendTask.controller;

import com.example.BackendTask.dto.AuthLoginRequestDTO;
import com.example.BackendTask.dto.AuthSignupRequestDTO;
import com.example.BackendTask.dto.AuthTokenResponseDTO;
import com.example.BackendTask.dto.UserResponseDTO;
import com.example.BackendTask.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponseDTO> signup(@Valid @RequestBody AuthSignupRequestDTO request) {
        return ResponseEntity.status(201).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthTokenResponseDTO> login(@Valid @RequestBody AuthLoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
