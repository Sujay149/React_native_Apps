package com.example.BackendTask.repository;

import com.example.BackendTask.entity.User;
import com.example.BackendTask.entity.UserFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFileRepository extends JpaRepository<UserFile, Long> {
    List<UserFile> findByUser(User user);

    Optional<UserFile> findByUser_IdAndFile_Id(Long userId, Long fileId);
}
