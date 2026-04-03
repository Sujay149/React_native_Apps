package com.example.BackendTask.repository;

import com.example.BackendTask.entity.Attendance;
import com.example.BackendTask.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByUserIdAndAttendanceDate(Long userId, LocalDate date);
    List<Attendance> findByUserIdOrderByAttendanceDateDesc(Long userId);
    List<Attendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByUserIdAndAttendanceDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByStatus(AttendanceStatus status);
    long countByUserIdAndStatus(Long userId, AttendanceStatus status);
}
