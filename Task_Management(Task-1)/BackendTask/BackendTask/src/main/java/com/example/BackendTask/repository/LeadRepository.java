package com.example.BackendTask.repository;

import com.example.BackendTask.entity.Lead;
import com.example.BackendTask.entity.LeadStatus;
import com.example.BackendTask.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<Lead> findByLeadStatus(LeadStatus leadStatus);
    List<Lead> findByApprovalStatus(ApprovalStatus approvalStatus);
    List<Lead> findByCategory(String category);
    List<Lead> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Lead> findByCreatedByIdAndApprovalStatus(Long createdById, ApprovalStatus approvalStatus);
    long countByApprovalStatus(ApprovalStatus approvalStatus);
    long countByLeadStatus(LeadStatus leadStatus);
}
