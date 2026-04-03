package com.example.BackendTask.repository;

import com.example.BackendTask.entity.Complaint;
import com.example.BackendTask.entity.ComplaintStatus;
import com.example.BackendTask.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Complaint> findByComplaintStatus(ComplaintStatus status);
    List<Complaint> findByPriority(Priority priority);
    List<Complaint> findByComplaintStatusOrderByCreatedAtDesc(ComplaintStatus status);
    List<Complaint> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    long countByComplaintStatus(ComplaintStatus status);
    long countByPriority(Priority priority);
}
