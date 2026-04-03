package com.example.BackendTask.controller;

import com.example.BackendTask.dto.AssignmentDTO;
import com.example.BackendTask.entity.Assignment;
import com.example.BackendTask.entity.Status;
import com.example.BackendTask.repository.AssignmentRepository;
import com.example.BackendTask.repository.UserRepository;
import com.example.BackendTask.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public AssignmentController(AssignmentRepository assignmentRepository,
                               UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssignmentDTO>> getUserAssignments(@PathVariable Long userId) {
        List<AssignmentDTO> assignments = assignmentRepository.findByAssignedToIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::assignmentToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/assigned-by/{userId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByUser(@PathVariable Long userId) {
        List<AssignmentDTO> assignments = assignmentRepository.findByAssignedById(userId)
                .stream()
                .map(this::assignmentToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDTO> getAssignment(@PathVariable Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        return ResponseEntity.ok(assignmentToDTO(assignment));
    }

    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(@Valid @RequestBody AssignmentDTO assignmentDTO) {
        User assignedBy = userRepository.findById(assignmentDTO.getAssignedById())
                .orElseThrow(() -> new IllegalArgumentException("Assigned by user not found"));
        
        User assignedTo = userRepository.findById(assignmentDTO.getAssignedToId())
                .orElseThrow(() -> new IllegalArgumentException("Assigned to user not found"));

        Assignment assignment = new Assignment();
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignedTo(assignedTo);
        assignment.setResourceType(assignmentDTO.getResourceType());
        assignment.setResourceId(assignmentDTO.getResourceId());
        assignment.setResourceName(assignmentDTO.getResourceName());
        assignment.setStatus(Status.ACTIVE);
        assignment.setCreatedAt(LocalDateTime.now());

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return ResponseEntity.status(201).body(assignmentToDTO(savedAssignment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentDTO> updateAssignment(@PathVariable Long id, 
                                                          @Valid @RequestBody AssignmentDTO assignmentDTO) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        assignment.setStatus(assignmentDTO.getStatus());
        assignment.setUpdatedAt(LocalDateTime.now());

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        return ResponseEntity.ok(assignmentToDTO(updatedAssignment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private AssignmentDTO assignmentToDTO(Assignment assignment) {
        AssignmentDTO dto = new AssignmentDTO();
        dto.setId(assignment.getId());
        dto.setAssignedById(assignment.getAssignedBy().getId());
        dto.setAssignedByName(assignment.getAssignedBy().getName());
        dto.setAssignedToId(assignment.getAssignedTo().getId());
        dto.setAssignedToName(assignment.getAssignedTo().getName());
        dto.setResourceType(assignment.getResourceType());
        dto.setResourceId(assignment.getResourceId());
        dto.setResourceName(assignment.getResourceName());
        dto.setStatus(assignment.getStatus());
        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setUpdatedAt(assignment.getUpdatedAt());
        return dto;
    }
}
