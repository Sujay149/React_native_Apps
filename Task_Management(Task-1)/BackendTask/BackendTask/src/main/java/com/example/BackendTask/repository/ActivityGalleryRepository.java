package com.example.BackendTask.repository;

import com.example.BackendTask.entity.ActivityGallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityGalleryRepository extends JpaRepository<ActivityGallery, Long> {
    List<ActivityGallery> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<ActivityGallery> findByPatientIdAndMediaType(Long patientId, String mediaType);
}
