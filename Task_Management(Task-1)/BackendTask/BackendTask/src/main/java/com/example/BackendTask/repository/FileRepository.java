package com.example.BackendTask.repository;

import com.example.BackendTask.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {
	List<File> findByUploadedBy_Id(Long userId);
}
