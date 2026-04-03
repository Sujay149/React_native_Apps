package com.example.BackendTask.repository;

import com.example.BackendTask.entity.LeaveRequest;
import com.example.BackendTask.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUserIdOrderByStartDateDesc(Long userId);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByUserIdAndStatus(Long userId, LeaveStatus status);
    List<LeaveRequest> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    List<LeaveRequest> findByUserIdAndStartDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
