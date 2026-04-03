package com.example.BackendTask.repository;

import com.example.BackendTask.entity.TaskAssignment;
import com.example.BackendTask.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {
    List<TaskAssignment> findByAssignmentId(Long assignmentId);
    List<TaskAssignment> findByTaskType(String taskType);
    List<TaskAssignment> findByStatus(TaskStatus status);
    List<TaskAssignment> findByAssignmentIdAndStatus(Long assignmentId, TaskStatus status);
}
