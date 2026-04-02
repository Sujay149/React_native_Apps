package com.example.BackendTask.repository;

import com.example.BackendTask.entity.UserRole;
import com.example.BackendTask.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUser_Id(Long userId);
}
