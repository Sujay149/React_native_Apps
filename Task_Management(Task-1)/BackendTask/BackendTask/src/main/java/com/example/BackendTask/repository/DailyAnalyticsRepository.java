package com.example.BackendTask.repository;

import com.example.BackendTask.entity.DailyAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyAnalyticsRepository extends JpaRepository<DailyAnalytics, Long> {
    Optional<DailyAnalytics> findByAnalyticsDateAndRole(LocalDate date, String role);
    List<DailyAnalytics> findByAnalyticsDateBetween(LocalDate startDate, LocalDate endDate);
    List<DailyAnalytics> findByRole(String role);
    List<DailyAnalytics> findByAnalyticsDateBetweenAndRole(LocalDate startDate, LocalDate endDate, String role);
}
