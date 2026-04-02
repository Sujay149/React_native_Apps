package com.example.BackendTask.repository;
import com.example.BackendTask.entity.User;
import com.example.BackendTask.entity.Role;
import com.example.BackendTask.entity.Status;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByName(String name);
    List<User> findByRole(Role role);

    List<User> findByStatus(Status status);

    List<User> findByRoleAndStatus(Role role, Status status);
}