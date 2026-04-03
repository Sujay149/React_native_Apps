package com.example.BackendTask.repository;

import com.example.BackendTask.entity.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface VillageRepository extends JpaRepository<Village, Long> {
    List<Village> findByMandalId(Long mandalId);
    Optional<Village> findByMandalIdAndName(Long mandalId, String name);
    List<Village> findByMandalIdOrderByNameAsc(Long mandalId);
}
