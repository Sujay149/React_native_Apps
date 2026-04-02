package com.example.BackendTask.controller;

import com.example.BackendTask.dto.FileMetadataDTO;
import com.example.BackendTask.service.FileService;
import jakarta.validation.constraints.Min;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@Validated
@PreAuthorize("isAuthenticated()")
public class FileController {

	private final FileService fileService;

	public FileController(FileService fileService) {
		this.fileService = fileService;
	}

	@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAnyRole('ADMIN','USER')")
	public ResponseEntity<FileMetadataDTO> uploadSingle(@RequestParam("file") MultipartFile file,
														@RequestParam("uploadedBy") @Min(value = 1, message = "uploadedBy must be positive") Long uploadedBy) {
		return ResponseEntity.status(201).body(fileService.uploadSingle(file, uploadedBy));
	}

	@PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAnyRole('ADMIN','USER')")
	public ResponseEntity<List<FileMetadataDTO>> uploadMultiple(@RequestParam("files") List<MultipartFile> files,
															@RequestParam("uploadedBy") @Min(value = 1, message = "uploadedBy must be positive") Long uploadedBy) {
		return ResponseEntity.status(201).body(fileService.uploadMultiple(files, uploadedBy));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN','USER')")
	public ResponseEntity<Resource> download(@PathVariable @Min(value = 1, message = "id must be positive") Long id) {
		FileMetadataDTO metadata = fileService.getMetadata(id);
		Resource file = fileService.download(id);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFileName() + "\"")
				.contentType(MediaType.parseMediaType(metadata.getFileType()))
				.body(file);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable @Min(value = 1, message = "id must be positive") Long id) {
		fileService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
