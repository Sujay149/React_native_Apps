package com.example.BackendTask.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

//     FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
// );
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_files")
public class UserFile {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "file_id", nullable = false)
	private File file;

	@Column(length = 255)
	private String tag;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
}
