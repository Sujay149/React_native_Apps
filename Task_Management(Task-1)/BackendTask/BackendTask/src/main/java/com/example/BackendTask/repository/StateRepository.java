package com.example.BackendTask.repository;

import com.example.BackendTask.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    Optional<State> findByName(String name);
    boolean existsByName(String name);
    List<State> findAllByOrderByNameAsc();
}
