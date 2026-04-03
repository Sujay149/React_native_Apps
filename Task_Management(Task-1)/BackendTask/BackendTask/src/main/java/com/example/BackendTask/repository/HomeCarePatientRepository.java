package com.example.BackendTask.repository;

import com.example.BackendTask.entity.HomeCarePatient;
import com.example.BackendTask.entity.ServiceModuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeCarePatientRepository extends JpaRepository<HomeCarePatient, Long> {
    List<HomeCarePatient> findByCreatedByIdOrderByCreatedAtDesc(Long createdById);
    List<HomeCarePatient> findByStatus(ServiceModuleStatus status);
    List<HomeCarePatient> findByDistrictAndMandal(String district, String mandal);
    List<HomeCarePatient> findByCreatedByIdAndStatus(Long createdById, ServiceModuleStatus status);
}
