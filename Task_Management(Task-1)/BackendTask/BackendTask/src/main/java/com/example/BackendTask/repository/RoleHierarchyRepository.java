package com.example.BackendTask.repository;

import com.example.BackendTask.entity.RoleHierarchy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface RoleHierarchyRepository extends JpaRepository<RoleHierarchy, Long> {
    Optional<RoleHierarchy> findByRoleId(Long roleId);
    List<RoleHierarchy> findAllByOrderByHierarchyLevelAsc();
}
