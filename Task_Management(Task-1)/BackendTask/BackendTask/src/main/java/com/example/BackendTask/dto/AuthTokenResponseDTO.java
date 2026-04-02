package com.example.BackendTask.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthTokenResponseDTO {
    private String tokenType;
    private String accessToken;
    private long expiresInSeconds;
}
