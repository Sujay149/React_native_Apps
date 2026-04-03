package com.example.BackendTask.repository;

import com.example.BackendTask.entity.EducationGuidanceRequest;
import com.example.BackendTask.entity.ServiceModuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationGuidanceRequestRepository extends JpaRepository<EducationGuidanceRequest, Long> {
    List<EducationGuidanceRequest> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<EducationGuidanceRequest> findByStatus(ServiceModuleStatus status);
    List<EducationGuidanceRequest> findByGuidanceType(String guidanceType);
    List<EducationGuidanceRequest> findByCreatedByIdAndStatus(Long createdById, ServiceModuleStatus status);
}
