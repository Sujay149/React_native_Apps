package com.example.BackendTask.repository;

import com.example.BackendTask.entity.HealthServiceIntake;
import com.example.BackendTask.entity.ServiceModuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthServiceIntakeRepository extends JpaRepository<HealthServiceIntake, Long> {
    List<HealthServiceIntake> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<HealthServiceIntake> findByStatus(ServiceModuleStatus status);
    List<HealthServiceIntake> findByCreatedByIdAndStatus(Long createdById, ServiceModuleStatus status);
}
