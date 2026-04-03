package com.example.BackendTask.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StateDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
}
