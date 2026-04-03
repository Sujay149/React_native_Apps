package com.example.BackendTask.repository;

import com.example.BackendTask.entity.ServiceAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ServiceAnalyticsRepository extends JpaRepository<ServiceAnalytics, Long> {
    List<ServiceAnalytics> findByServiceType(String serviceType);
    List<ServiceAnalytics> findByAnalyticsDate(LocalDate date);
    List<ServiceAnalytics> findByAnalyticsDateBetween(LocalDate startDate, LocalDate endDate);
    List<ServiceAnalytics> findByServiceTypeAndAnalyticsDateBetween(String serviceType, LocalDate startDate, LocalDate endDate);
}
