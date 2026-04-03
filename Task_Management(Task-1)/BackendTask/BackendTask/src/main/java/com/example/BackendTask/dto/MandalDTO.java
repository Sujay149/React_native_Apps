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
public class MandalDTO {
    private Long id;
    private Long districtId;
    private String name;
    private LocalDateTime createdAt;
}
