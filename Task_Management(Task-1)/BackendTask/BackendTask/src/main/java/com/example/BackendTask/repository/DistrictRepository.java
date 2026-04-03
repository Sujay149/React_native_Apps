package com.example.BackendTask.repository;

import com.example.BackendTask.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByStateId(Long stateId);
    Optional<District> findByStateIdAndName(Long stateId, String name);
    List<District> findByStateIdOrderByNameAsc(Long stateId);
}
