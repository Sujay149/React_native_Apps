package com.example.BackendTask.repository;

import com.example.BackendTask.entity.SecurityComplaint;
import com.example.BackendTask.entity.SecurityComplaintStatus;
import com.example.BackendTask.entity.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityComplaintRepository extends JpaRepository<SecurityComplaint, Long> {
    List<SecurityComplaint> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<SecurityComplaint> findByStatus(SecurityComplaintStatus status);
    List<SecurityComplaint> findBySeverity(Severity severity);
    List<SecurityComplaint> findByAssignedToIdAndStatus(Long assignedToId, SecurityComplaintStatus status);
}
