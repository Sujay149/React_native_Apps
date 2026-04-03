package com.example.BackendTask.repository;

import com.example.BackendTask.entity.Mandal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface MandalRepository extends JpaRepository<Mandal, Long> {
    List<Mandal> findByDistrictId(Long districtId);
    Optional<Mandal> findByDistrictIdAndName(Long districtId, String name);
    List<Mandal> findByDistrictIdOrderByNameAsc(Long districtId);
}
