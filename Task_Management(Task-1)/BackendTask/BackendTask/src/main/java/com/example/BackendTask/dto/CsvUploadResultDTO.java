package com.example.BackendTask.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CsvUploadResultDTO {
    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<String> errors = new ArrayList<>();
    private List<UserResponseDTO> createdUsers = new ArrayList<>();
}
