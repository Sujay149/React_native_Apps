package com.example.BackendTask.repository;

import com.example.BackendTask.entity.MarketingEntry;
import com.example.BackendTask.entity.ApprovalStatus;
import com.example.BackendTask.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketingEntryRepository extends JpaRepository<MarketingEntry, Long> {
    List<MarketingEntry> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<MarketingEntry> findByApprovalStatus(ApprovalStatus approvalStatus);
    List<MarketingEntry> findByLeadStatus(LeadStatus leadStatus);
    List<MarketingEntry> findByCreatedByIdAndApprovalStatus(Long createdById, ApprovalStatus approvalStatus);
    long countByApprovalStatus(ApprovalStatus approvalStatus);
}
