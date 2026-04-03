package com.example.BackendTask.repository;

import com.example.BackendTask.entity.Assignment;
import com.example.BackendTask.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByAssignedToId(Long assignedToId);
    List<Assignment> findByAssignedById(Long assignedById);
    List<Assignment> findByAssignedToIdAndStatus(Long assignedToId, Status status);
    List<Assignment> findByResourceTypeAndResourceId(String resourceType, Long resourceId);
    List<Assignment> findByAssignedToIdOrderByCreatedAtDesc(Long assignedToId);
    Optional<Assignment> findByAssignedToIdAndResourceTypeAndResourceId(Long assignedToId, String resourceType, Long resourceId);
}
